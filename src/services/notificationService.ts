import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
}

export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>('/notification/my'); 
      return response.data;
    } catch (error: any) {
      throw new Error('Greška pri dohvaćanju notifikacija');
    }
  }

  static async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.put(`/notification/${notificationId}/read`);
    } catch (error: any) {
      throw new Error('Greška pri označavanju kao pročitano');
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notification/my/read-all'); 
    } catch (error: any) {
      throw new Error('Greška pri označavanju svih kao pročitano');
    }
  }

  static async deleteNotification(notificationId: number): Promise<void> {
    try {
      await api.delete(`/notification/${notificationId}`);
    } catch (error: any) {
      throw new Error('Greška pri brisanju notifikacije');
    }
  }
}