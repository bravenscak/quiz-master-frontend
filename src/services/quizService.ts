import api from './api';
import { QuizCardData, QuizDetails, QuizSearchParams } from '../types/quiz';

export class QuizService {
  static async getQuizzes(params?: QuizSearchParams): Promise<QuizCardData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.searchTerm) {
        queryParams.append('searchTerm', params.searchTerm);
      }
      if (params?.categoryId) {
        queryParams.append('categoryId', params.categoryId.toString());
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortDirection) {
        queryParams.append('sortDirection', params.sortDirection);
      }

      const url = `/quiz${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<QuizCardData[]>(url);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju kvizova');
    }
  }

  static async getQuizById(id: number): Promise<QuizDetails> {
    try {
      const response = await api.get<QuizDetails>(`/quiz/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Kviz nije pronađen');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju kviza');
    }
  }
}