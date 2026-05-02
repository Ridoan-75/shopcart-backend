import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── helper: fetch products by ids ────────────────────────────────────────────
const getProductsByIds = async (ids: string[]) => {
  return prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      price: true,
      comparePrice: true,
      avgRating: true,
      totalReviews: true,
      totalSold: true,
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true } },
      inventory: { select: { quantity: true } },
    },
  });
};

// ─── 1. User Based Recommendations ────────────────────────────────────────────
export const getUserRecommendationsService = async (userId: string) => {
  // get user's order history → extract category & brand preferences
  const orders = await prisma.order.findMany({
    where: { userId, status: "DELIVERED" },
    include: {
      items: {
        include: {
          product: {
            select: {
              categoryId: true,
              brandId: true,
              id: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // get user's wishlist
  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    select: { product: { select: { categoryId: true, brandId: true, id: true } } },
  });

  // get user's reviewed products
  const reviews = await prisma.review.findMany({
    where: { userId, rating: { gte: 4 } },
    select: { product: { select: { categoryId: true, brandId: true, id: true } } },
  });

  // collect all interacted product ids to exclude
  const interactedProductIds = new Set<string>();
  const categoryCount: Record<string, number> = {};
  const brandCount: Record<string, number> = {};

  const processProduct = (p: { id: string; categoryId: string; brandId: string | null }) => {
    interactedProductIds.add(p.id);
    categoryCount[p.categoryId] = (categoryCount[p.categoryId] || 0) + 1;
    if (p.brandId) {
      brandCount[p.brandId] = (brandCount[p.brandId] || 0) + 1;
    }
  };

  orders.forEach((o) => o.items.forEach((i) => processProduct(i.product)));
  wishlist.forEach((w) => processProduct(w.product));
  reviews.forEach((r) => processProduct(r.product));

  // sort by frequency
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const topBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  // fetch recommended products
  let recommended = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: Array.from(interactedProductIds) },
      OR: [
        ...(topCategories.length ? [{ categoryId: { in: topCategories } }] : []),
        ...(topBrands.length ? [{ brandId: { in: topBrands } }] : []),
      ],
    },
    orderBy: [{ totalSold: "desc" }, { avgRating: "desc" }],
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      price: true,
      comparePrice: true,
      avgRating: true,
      totalReviews: true,
      totalSold: true,
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true } },
      inventory: { select: { quantity: true } },
    },
  });

  // fallback — if no history, return best sellers
  if (recommended.length < 6) {
    const fallback = await prisma.product.findMany({
      where: { isActive: true, id: { notIn: recommended.map((p) => p.id) } },
      orderBy: [{ totalSold: "desc" }, { avgRating: "desc" }],
      take: 12 - recommended.length,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        price: true,
        comparePrice: true,
        avgRating: true,
        totalReviews: true,
        totalSold: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
        inventory: { select: { quantity: true } },
      },
    });
    recommended = [...recommended, ...fallback];
  }

  // save recommendation log
  await prisma.aiRecommendation.create({
    data: {
      userId,
      productIds: recommended.map((p) => p.id),
      context: topCategories.length ? "purchase_history" : "popular",
    },
  });

  return {
    context: topCategories.length ? "based_on_your_history" : "popular_picks",
    recommendations: recommended,
  };
};

// ─── 2. Similar Products ───────────────────────────────────────────────────────
export const getSimilarProductsService = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      categoryId: true,
      brandId: true,
      price: true,
      tags: { select: { tagId: true } },
    },
  });
  if (!product) throw new AppError("Product not found", 404);

  const tagIds = product.tags.map((t) => t.tagId);

  // score-based similarity
  const similar = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      OR: [
        { categoryId: product.categoryId },
        ...(product.brandId ? [{ brandId: product.brandId }] : []),
        ...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
        // price range ±30%
        {
          price: {
            gte: product.price * 0.7,
            lte: product.price * 1.3,
          },
        },
      ],
    },
    orderBy: [{ totalSold: "desc" }, { avgRating: "desc" }],
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      price: true,
      comparePrice: true,
      avgRating: true,
      totalReviews: true,
      category: { select: { id: true, name: true, slug: true } },
      inventory: { select: { quantity: true } },
    },
  });

  return similar;
};

// ─── 3. Search Suggestions ────────────────────────────────────────────────────
export const getSearchSuggestionsService = async (
  query: string,
  userId?: string,
  ip?: string
) => {
  if (!query || query.trim().length < 2) return { suggestions: [] };

  const q = query.trim();

  // parallel search across products, categories, brands
  const [products, categories, brands, popularSearches] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true, thumbnail: true, price: true },
      orderBy: { totalSold: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
    prisma.brand.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
    // trending queries matching search
    prisma.searchLog.findMany({
      where: { query: { contains: q, mode: "insensitive" } },
      select: { query: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      distinct: ["query"],
    }),
  ]);

  // log search
  await prisma.searchLog.create({
    data: {
      query: q,
      results: products.length,
      userId: userId || null,
      ip: ip || null,
    },
  });

  return {
    suggestions: {
      products: products.map((p) => ({ ...p, type: "product" })),
      categories: categories.map((c) => ({ ...c, type: "category" })),
      brands: brands.map((b) => ({ ...b, type: "brand" })),
      popularSearches: [
        ...new Set(popularSearches.map((s) => s.query)),
      ].slice(0, 5),
    },
  };
};

// ─── 4. Trending Products ─────────────────────────────────────────────────────
export const getTrendingProductsService = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // products with most orders in last 7 days
  const recentOrderItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { createdAt: { gte: sevenDaysAgo } } },
    _count: { productId: true },
    _sum: { quantity: true },
    orderBy: { _count: { productId: "desc" } },
    take: 12,
  });

  if (recentOrderItems.length > 0) {
    const productIds = recentOrderItems.map((item) => item.productId);
    const products = await getProductsByIds(productIds);

    // sort by order count
    const sorted = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    return { context: "trending_this_week", products: sorted };
  }

  // fallback — most sold all time
  const fallback = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ totalSold: "desc" }, { avgRating: "desc" }],
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      price: true,
      comparePrice: true,
      avgRating: true,
      totalReviews: true,
      totalSold: true,
      category: { select: { id: true, name: true, slug: true } },
      inventory: { select: { quantity: true } },
    },
  });

  return { context: "best_sellers", products: fallback };
};

// ─── 5. AI Chatbot ────────────────────────────────────────────────────────────
export const aiChatService = async (
  userId: string,
  message: string
) => {
  if (!message?.trim()) throw new AppError("Message is required", 400);

  const lowerMsg = message.toLowerCase();

  // ── Order status intent ──
  if (
    lowerMsg.includes("order") &&
    (lowerMsg.includes("status") || lowerMsg.includes("where") || lowerMsg.includes("track"))
  ) {
    const latestOrder = await prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        shipping: { select: { status: true, trackingNumber: true, carrier: true } },
      },
    });

    if (latestOrder) {
      const shipping = latestOrder.shipping;
      return {
        intent: "order_status",
        reply: `Your latest order #${latestOrder.id.slice(-8).toUpperCase()} is currently **${latestOrder.status}**. ${
          shipping?.trackingNumber
            ? `Tracking: ${shipping.carrier} - ${shipping.trackingNumber}`
            : ""
        }`,
        data: { orderId: latestOrder.id, status: latestOrder.status },
      };
    }
    return {
      intent: "order_status",
      reply: "I couldn't find any recent orders for your account.",
      data: null,
    };
  }

  // ── Return/refund intent ──
  if (
    lowerMsg.includes("return") ||
    lowerMsg.includes("refund") ||
    lowerMsg.includes("cancel")
  ) {
    return {
      intent: "return_policy",
      reply:
        "Our return policy allows returns within **7 days** of delivery. Items must be unused and in original packaging. To initiate a return, go to My Orders → Select Order → Request Return.",
      data: { link: "/orders" },
    };
  }

  // ── Shipping intent ──
  if (lowerMsg.includes("ship") || lowerMsg.includes("deliver") || lowerMsg.includes("delivery")) {
    return {
      intent: "shipping_info",
      reply:
        "We offer standard delivery (3-5 days) and express delivery (1-2 days). Free shipping on orders above ৳999. You can track your order from My Orders section.",
      data: null,
    };
  }

  // ── Discount/coupon intent ──
  if (
    lowerMsg.includes("discount") ||
    lowerMsg.includes("coupon") ||
    lowerMsg.includes("promo") ||
    lowerMsg.includes("offer")
  ) {
    const activeSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      select: { title: true, endsAt: true },
    });

    if (activeSale) {
      return {
        intent: "discount",
        reply: `🔥 **${activeSale.title}** is currently active! Hurry, it ends soon. Check it out in our Flash Sales section.`,
        data: { link: "/flash-sales" },
      };
    }

    return {
      intent: "discount",
      reply:
        "Check our Flash Sales section for the latest deals! You can also subscribe to our newsletter for exclusive discounts.",
      data: { link: "/flash-sales" },
    };
  }

  // ── Product search intent ──
  if (
    lowerMsg.includes("find") ||
    lowerMsg.includes("search") ||
    lowerMsg.includes("looking for") ||
    lowerMsg.includes("need")
  ) {
    return {
      intent: "product_search",
      reply:
        "You can search for products using the search bar at the top of the page. You can also filter by category, brand, price range, and rating!",
      data: { link: "/products" },
    };
  }

  // ── Payment intent ──
  if (lowerMsg.includes("pay") || lowerMsg.includes("payment") || lowerMsg.includes("method")) {
    return {
      intent: "payment",
      reply:
        "We accept **Credit/Debit Cards**, **Mobile Banking (bKash, Nagad)**, and **Cash on Delivery**. All online payments are secured with SSL encryption.",
      data: null,
    };
  }

  // ── Contact intent ──
  if (
    lowerMsg.includes("contact") ||
    lowerMsg.includes("support") ||
    lowerMsg.includes("help") ||
    lowerMsg.includes("human")
  ) {
    return {
      intent: "contact",
      reply:
        "You can reach our support team at **support@shopcart.com** or call us at **+880-1700-000000** (10AM - 7PM, Sat-Thu). You can also visit our Contact page.",
      data: { link: "/contact" },
    };
  }

  // ── Greeting intent ──
  if (
    lowerMsg.includes("hi") ||
    lowerMsg.includes("hello") ||
    lowerMsg.includes("hey") ||
    lowerMsg.includes("assalamualaikum")
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return {
      intent: "greeting",
      reply: `Hello ${user?.name?.split(" ")[0] ?? "there"}! 👋 How can I help you today? I can assist with orders, shipping, returns, payments, and product search.`,
      data: null,
    };
  }

  // ── Default fallback ──
  return {
    intent: "unknown",
    reply:
      "I'm not sure I understood that. I can help you with:\n• 📦 Order tracking\n• 🚚 Shipping info\n• 🔄 Returns & refunds\n• 💳 Payment methods\n• 🔥 Discounts & flash sales\n• 🔍 Finding products\n\nWhat would you like to know?",
    data: null,
  };
};