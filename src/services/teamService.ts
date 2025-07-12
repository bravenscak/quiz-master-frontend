import api from './api';

export interface Team {
  id: number;
  name: string;
  participantCount: number;
  finalPosition?: number;
  captainName: string;
  quizName: string;
  quizDateTime: string;
  maxParticipantsPerTeam: number; 
  quizId: number;
}

export interface QuizTeam {
  id: number;
  name: string;
  participantCount: number;
  finalPosition?: number;
  captainName: string;
  captainEmail: string;
}

export interface CreateTeamRequest {
  name: string;
  participantCount: number;
  quizId: number;
}

export interface UpdateTeamRequest {
  name: string;
  participantCount: number;
}

export class TeamService {
  static async getMyTeams(): Promise<Team[]> {
    try {
      const response = await api.get<Team[]>('/team/my');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju timova');
    }
  }

  static async getTeamsByQuizId(quizId: number): Promise<QuizTeam[]> {
    try {
      const response = await api.get<QuizTeam[]>(`/team/quiz/${quizId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri dohvaćanju timova kviza');
    }
  }

  static async registerTeam(teamData: CreateTeamRequest): Promise<Team> {
    try {
      const response = await api.post<Team>('/team', teamData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri registraciji tima');
    }
  }

  static async updateTeam(teamId: number, teamData: UpdateTeamRequest): Promise<Team> {
    try {
      const response = await api.put<Team>(`/team/${teamId}`, teamData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri ažuriranju tima');
    }
  }

  static async deleteTeam(teamId: number): Promise<void> {
    try {
      await api.delete(`/team/${teamId}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Greška pri brisanju tima');
    }
  }
  static async getUserTeamForQuiz(quizId: number, userEmail: string): Promise<QuizTeam | null> {
    try {
      const quizTeams = await TeamService.getTeamsByQuizId(quizId);

      const userTeam = quizTeams.find(team => team.captainEmail === userEmail);

      return userTeam || null;
    } catch (error) {
      console.error('Greška pri provjeri registracije:', error);
      return null;
    }
  }
}