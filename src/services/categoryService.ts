import api from './api';

export interface Category {
  id: number;
  name: string;
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>('/category');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju kategorija');
    }
  }

  static async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get<Category>(`/category/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Kategorija nije pronađena');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju kategorije');
    }
  }
}