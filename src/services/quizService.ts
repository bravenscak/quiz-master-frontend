import api from './api';
import { QuizCardData, QuizDetails, QuizSearchParams, CreateQuizRequest, UpdateQuizRequest } from '../types/quiz';

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

  static async createQuiz(quizData: CreateQuizRequest): Promise<QuizDetails> {
    try {
      const response = await api.post<QuizDetails>('/quiz', quizData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 401) {
        throw new Error('Nemate dozvolu za kreiranje kviza');
      }
      if (error.response?.status === 400) {
        throw new Error('Podaci o kvizu nisu ispravni');
      }
      if (error.response?.status === 403) {
        throw new Error('Pristup odbačen - samo organizatori mogu kreirati kvizove');
      }
      throw new Error('Greška pri kreiranju kviza');
    }
  }

  static async updateQuiz(id: number, quizData: UpdateQuizRequest): Promise<QuizDetails> {
    try {
      const response = await api.put<QuizDetails>(`/quiz/${id}`, quizData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data && typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 401) {
        throw new Error('Nemate dozvolu za uređivanje kviza');
      }
      if (error.response?.status === 403) {
        throw new Error('Možete uređivati samo svoje kvizove');
      }
      if (error.response?.status === 404) {
        throw new Error('Kviz nije pronađen');
      }
      throw new Error('Greška pri ažuriranju kviza');
    }
  }

  static async deleteQuiz(id: number): Promise<void> {
    try {
      await api.delete(`/quiz/${id}`);
    } catch (error: any) {
      if (error.response?.data && typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      if (error.response?.status === 403) {
        throw new Error('Možete obrisati samo svoje kvizove');
      }
      if (error.response?.status === 404) {
        throw new Error('Kviz nije pronađen');
      }
      throw new Error('Greška pri brisanju kviza');
    }
  }

}