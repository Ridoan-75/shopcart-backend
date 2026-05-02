import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import type { OrderStatus, Role } from "../../../generated/prisma/enums";

// ─── Overview Stats ────────────────────────────────────────────────────────────
export const getDashboardStatsService = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    monthlyUsers,
    monthlyOrders,
    monthlyRevenue,
    lastMonthUsers,
    lastMonthOrders,
    lastMonthRevenue,
    pendingOrders,
    totalReviews,
    activeFlashSales,
    newsletterSubscribers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] } },
      _sum: { total: true },
    }),
    // this month
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] },
      },
      _sum: { total: true },
    }),
    // last month
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] },
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.flashSale.count({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    }),
    prisma.newsletter.count({ where: { isActive: true } }),
  ]);

  // growth % helper
  const growth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    overview: {
      totalUsers: {
        value: totalUsers,
        monthly: monthlyUsers,
        growth: growth(monthlyUsers, lastMonthUsers),
      },
      totalProducts: {
        value: totalProducts,
      },
      totalOrders: {
        value: totalOrders,
        monthly: monthlyOrders,
        growth: growth(monthlyOrders, lastMonthOrders),
      },
      totalRevenue: {
        value: totalRevenue._sum.total ?? 0,
        monthly: monthlyRevenue._sum.total ?? 0,
        growth: growth(
          monthlyRevenue._sum.total ?? 0,
          lastMonthRevenue._sum.total ?? 0
        ),
      },
    },
    alerts: {
      pendingOrders,
      pendingReviews: totalReviews,
      activeFlashSales,
      newsletterSubscribers,
    },
  };
};

// ─── Sales Chart ───────────────────────────────────────────────────────────────
export const getSalesChartService = async (
  period: "daily" | "weekly" | "monthly" = "monthly"
) => {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;

  if (period === "daily") {
    // last 30 days
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
    groupFormat = "day";
  } else if (period === "weekly") {
    // last 12 weeks
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 84);
    groupFormat = "week";
  } else {
    // last 12 months
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 12);
    groupFormat = "month";
  }

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // group by period
  const grouped: Record<string, { revenue: number; orders: number }> = {};

  orders.forEach((order) => {
    let key: string;
    const d = new Date(order.createdAt);

    if (period === "daily") {
      key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (period === "weekly") {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!grouped[key]) grouped[key] = { revenue: 0, orders: 0 };
    grouped[key].revenue += order.total;
    grouped[key].orders += 1;
  });

  const chart = Object.entries(grouped).map(([label, data]) => ({
    label,
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders,
  }));

  return { period, chart };
};

// ─── Top Products ──────────────────────────────────────────────────────────────
export const getTopProductsService = async (limit = 10) => {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { totalSold: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      price: true,
      totalSold: true,
      avgRating: true,
      totalReviews: true,
      category: { select: { id: true, name: true } },
      inventory: { select: { quantity: true } },
    },
  });
};

// ─── Recent Orders ─────────────────────────────────────────────────────────────
export const getRecentOrdersService = async (limit = 10) => {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      address: {
        select: { city: true, country: true },
      },
      _count: { select: { items: true } },
    },
  });
};

// ─── Low Stock Products ────────────────────────────────────────────────────────
export const getLowStockDashboardService = async () => {
  const inventories = await prisma.inventory.findMany({
    where: { quantity: { lte: 10 } },
    orderBy: { quantity: "asc" },
    take: 20,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          thumbnail: true,
          isActive: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  return inventories.map((inv) => ({
    ...inv,
    isOutOfStock: inv.quantity === 0,
    isLowStock: inv.quantity > 0 && inv.quantity <= inv.lowStockAlert,
  }));
};

// ─── Order Status Breakdown ────────────────────────────────────────────────────
export const getOrderStatusBreakdownService = async () => {
  const breakdown = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
    _sum: { total: true },
  });

  return breakdown.map((item) => ({
    status: item.status as OrderStatus,
    count: item._count.id,
    revenue: item._sum.total ?? 0,
  }));
};

// ─── User Role Breakdown ───────────────────────────────────────────────────────
export const getUserRoleBreakdownService = async () => {
  const breakdown = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  return breakdown.map((item) => ({
    role: item.role as Role,
    count: item._count.id,
  }));
};