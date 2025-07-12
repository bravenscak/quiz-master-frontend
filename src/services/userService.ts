import api from "./api";
import { UserResponse } from "../types/auth";
import { QuizCardData, QuizSearchParams } from "../types/quiz";

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
}
