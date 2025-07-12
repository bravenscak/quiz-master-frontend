import api from './api';

export interface Subscription {
  id: number;
  organizerId: number;
  organizerName: string;
  organizationName?: string;
}

export class SubscriptionService {
  static async getSubscriptionStatus(organizerId: number): Promise<boolean> {
    try {
      const response = await api.get<boolean>(`/subscription/organizer/${organizerId}/status`);
      return response.data;
    } catch (error: any) {
      throw new Error('Greška pri provjeri subscription statusa');
    }
  }

  static async toggleSubscription(organizerId: number): Promise<boolean> {
    try {
      const response = await api.post<{ isSubscribed: boolean }>(`/subscription/organizer/${organizerId}/toggle`);
      return response.data.isSubscribed;
    } catch (error: any) {
      if (error.response?.data?.includes('Cannot subscribe to yourself')) {
        throw new Error('Ne možeš se pretplatiti sam na sebe');
      }
      throw new Error('Greška pri mijenjanju subscription-a');
    }
  }

  static async getMySubscriptions(): Promise<Subscription[]> {
    try {
      const response = await api.get<Subscription[]>('/subscription/my');
      return response.data;
    } catch (error: any) {
      throw new Error('Greška pri dohvaćanju subscription-a');
    }
  }
}