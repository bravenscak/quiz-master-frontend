import api from "./api";
import { UserResponse } from "../types/auth";
import { QuizCardData, QuizSearchParams } from "../types/quiz";

export interface UpdateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    organizationName?: string;
    description?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export class UserService {
    static async getUserById(id: number): Promise<UserResponse> {
        try {
            const response = await api.get<UserResponse>(`/user/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error("Organizator nije pronađen");
            }
            throw new Error("Greška pri dohvaćanju organizatora");
        }
    }

    static async getOrganizerQuizzes(organizerId: number): Promise<QuizCardData[]> {
        try {
            const response = await api.get<QuizCardData[]>(`/quiz/organizer/${organizerId}`);
            return response.data;
        } catch (error: any) {
            throw new Error('Greška pri dohvaćanju kvizova organizatora');
        }
    }

    static async updateUser(userData: UpdateUserRequest): Promise<UserResponse> {
        try {
            const response = await api.put<UserResponse>('/user/profile', userData);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Greška pri ažuriranju profila');
        }
    }

    static async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
        try {
            await api.put('/user/change-password', passwordData);
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Greška pri mijenjanju lozinke');
        }
    }
}
