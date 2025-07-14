import api from './api';

export interface PendingOrganizerDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  organizationName?: string;
  description?: string;
  roleName: string;
  isApproved: boolean;
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  organizationName?: string;
  description?: string;
  roleName: string;
  isApproved?: boolean;
}

export interface AdminStatsDto {
  totalUsers: number;
  competitorCount: number;
  organizerCount: number;
  adminCount: number;
  pendingOrganizerCount: number;
  totalQuizzes: number;
  upcomingQuizzes: number;
  completedQuizzes: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
}

export class AdminService {
  static async getPendingOrganizers(): Promise<PendingOrganizerDto[]> {
    try {
      const response = await api.get<PendingOrganizerDto[]>('/admin/pending-organizers');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za pristup admin funkcijama');
      }
      throw new Error('Greška pri dohvaćanju pending organizatora');
    }
  }

  static async approveOrganizer(id: number): Promise<void> {
    try {
      await api.put(`/admin/approve-organizer/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Organizator nije pronađen ili je već odobren');
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za odobravanje organizatora');
      }
      throw new Error('Greška pri odobravanju organizatora');
    }
  }

  static async rejectOrganizer(id: number): Promise<void> {
    try {
      await api.put(`/admin/reject-organizer/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Organizator nije pronađen');
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za odbijanje organizatora');
      }
      throw new Error('Greška pri odbijanju organizatora');
    }
  }

  static async getAllUsers(): Promise<UserDto[]> {
    try {
      const response = await api.get<UserDto[]>('/admin/users');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za pristup korisnicima');
      }
      throw new Error('Greška pri dohvaćanju korisnika');
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Korisnik nije pronađen');
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za brisanje korisnika');
      }
      throw new Error('Greška pri brisanju korisnika');
    }
  }

  static async createCategory(categoryDto: CreateCategoryDto): Promise<void> {
    try {
      await api.post('/category', categoryDto);
    } catch (error: any) {
      if (error.response?.data && typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za kreiranje kategorija');
      }
      throw new Error('Greška pri kreiranju kategorije');
    }
  }

  static async updateCategory(id: number, categoryDto: UpdateCategoryDto): Promise<void> {
    try {
      await api.put(`/category/${id}`, categoryDto);
    } catch (error: any) {
      if (error.response?.data && typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za ažuriranje kategorija');
      }
      if (error.response?.status === 404) {
        throw new Error('Kategorija nije pronađena');
      }
      throw new Error('Greška pri ažuriranju kategorije');
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/category/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Kategorija nije pronađena');
      }
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za brisanje kategorija');
      }
      if (error.response?.data && typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      }
      throw new Error('Greška pri brisanju kategorije');
    }
  }

  static async getAllQuizzes(): Promise<any[]> {
    try {
      const response = await api.get('/admin/all-quizzes');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Nemate dozvolu za pristup kvizovima');
      }
      throw new Error('Greška pri dohvaćanju kvizova');
    }
  }

  static async getAdminStats(): Promise<AdminStatsDto> {
    try {
      const [users, pendingOrganizers] = await Promise.all([
        this.getAllUsers(),
        this.getPendingOrganizers()
      ]);

      const competitorCount = users.filter(u => u.roleName === 'COMPETITOR').length;
      const organizerCount = users.filter(u => u.roleName === 'ORGANIZER').length;
      const adminCount = users.filter(u => u.roleName === 'ADMIN').length;

      let totalQuizzes = 0;
      let upcomingQuizzes = 0;
      let completedQuizzes = 0;

      try {
        const allQuizzesResponse = await api.get('/admin/all-quizzes');
        const allQuizzes = allQuizzesResponse.data;

        totalQuizzes = allQuizzes.length;

        const now = new Date();
        upcomingQuizzes = allQuizzes.filter((q: any) => new Date(q.dateTime) > now).length;
        completedQuizzes = allQuizzes.filter((q: any) => new Date(q.dateTime) <= now).length;
      } catch (error) {
        console.warn('Greška pri dohvaćanju kvizova za statistike:', error);
      }

      return {
        totalUsers: users.length,
        competitorCount,
        organizerCount,
        adminCount,
        pendingOrganizerCount: pendingOrganizers.length,
        totalQuizzes,
        upcomingQuizzes,
        completedQuizzes,
      };
    } catch (error: any) {
      throw new Error('Greška pri dohvaćanju statistika');
    }
  }
}