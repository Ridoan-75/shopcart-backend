import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import type { NotificationType } from "../../../generated/prisma/enums";

// ─── Create Notification (internal helper) ─────────────────────────────────────
export const createNotificationService = async (payload: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: object;
}) => {
  return prisma.notification.create({
    data: payload,
  });
};

// ─── Get User Notifications ────────────────────────────────────────────────────
export const getUserNotificationsService = async (
  userId: string,
  query: {
    isRead?: string;
    type?: NotificationType;
    page?: string;
    limit?: string;
  }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.isRead !== undefined) where.isRead = query.isRead === "true";
  if (query.type) where.type = query.type;

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    data,
    unreadCount,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Mark Single As Read ───────────────────────────────────────────────────────
export const markAsReadService = async (id: string, userId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError("Notification not found", 404);
  if (notification.userId !== userId)
    throw new AppError("Not authorized", 403);

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

// ─── Mark All As Read ──────────────────────────────────────────────────────────
export const markAllAsReadService = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { message: "All notifications marked as read" };
};

// ─── Delete Notification ───────────────────────────────────────────────────────
export const deleteNotificationService = async (
  id: string,
  userId: string
) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError("Notification not found", 404);
  if (notification.userId !== userId)
    throw new AppError("Not authorized", 403);

  await prisma.notification.delete({ where: { id } });
  return { message: "Notification deleted" };
};

// ─── Delete All Read Notifications ────────────────────────────────────────────
export const deleteAllReadService = async (userId: string) => {
  await prisma.notification.deleteMany({
    where: { userId, isRead: true },
  });
  return { message: "All read notifications cleared" };
};

// ─── Admin: Send Notification to User ─────────────────────────────────────────
export const sendNotificationService = async (payload: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: object;
}) => {
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError("User not found", 404);

  return prisma.notification.create({ data: payload });
};

// ─── Admin: Broadcast to All Users ────────────────────────────────────────────
export const broadcastNotificationService = async (payload: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: users.map((u) => ({ ...payload, userId: u.id })),
  });

  return { message: `Notification sent to ${users.length} users` };
};