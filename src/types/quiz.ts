export interface QuizCardData {
  id: number;
  name: string;
  organizerName: string;
  organizerId: number; 
  locationName: string;
  address: string;   
  dateTime: string; 
  categoryName: string;
  registeredTeamsCount: number;  
  maxTeams: number;    
  entryFee?: number;    
}

export interface QuizDetails {
  id: number;
  name: string;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  entryFee?: number;
  dateTime: string;
  maxParticipantsPerTeam: number;
  maxTeams: number;
  durationMinutes?: number;
  description?: string;
  organizerName: string;
  organizerId: number;  
  categoryName: string;
  registeredTeamsCount: number;
}

export interface QuizSearchParams {
  searchTerm?: string;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'DateTime' | 'Name' | 'CategoryName' | 'RegisteredTeams';
  sortDirection?: 'Ascending' | 'Descending';
}

export interface CreateQuizRequest {
  name: string;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  entryFee?: number;
  dateTime: string; 
  maxParticipantsPerTeam: number;
  maxTeams: number;
  durationMinutes?: number;
  description?: string;
  categoryId: number;
}

export interface UpdateQuizRequest {
  name: string;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  entryFee?: number;
  dateTime: string;
  maxParticipantsPerTeam: number;
  maxTeams: number;
  durationMinutes?: number;
  description?: string;
  categoryId: number;
}