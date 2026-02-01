import { NotificationType } from '@prisma/client'
import prisma from './prisma'

/**
 * Create a notification for a user
 * @param userId - User ID to send notification to
 * @param type - Type of notification
 * @param title - Notification title
 * @param message - Notification message
 * @param link - Optional link to related resource
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        isRead: false,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

/**
 * Create notifications for multiple users
 * @param userIds - Array of user IDs
 * @param type - Type of notification
 * @param title - Notification title
 * @param message - Notification message
 * @param link - Optional link to related resource
 */
export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        link,
        isRead: false,
      })),
    })
  } catch (error) {
    console.error('Failed to create bulk notifications:', error)
  }
}

/**
 * Mark a notification as read
 * @param notificationId - Notification ID
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId - User ID
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

/**
 * Get unread notification count for a user
 * @param userId - User ID
 * @returns Number of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    })
  } catch (error) {
    console.error('Failed to get unread notification count:', error)
    return 0
  }
}

/**
 * Delete old read notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    })
  } catch (error) {
    console.error('Failed to cleanup old notifications:', error)
  }
}
