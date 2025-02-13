export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePhoto: string | null;
  memberSince: string;
  createdAt: string;
  gym?: {
    id: number;
    name: string;
  } | null;
}

export interface Send {
  id: number;
  userId: number;
  grade: string;
  attempts: number;
  notes: string;
  createdAt: string;
}

export interface Session {
  id: number;
  userId: number;
  duration: number;
  location: string;
  createdAt: string;
}

export interface Standing {
  userId: number;
  username: string;
  totalSends: number;
  avgGrade: string;
  totalPoints: number;
  rank?: number;
  burns: number;
  grade: string;
  points: number;
}

export interface Stats {
  totalSends: number;
  averageGrade: string;
  bestGrade: string;
  totalSessions: number;
  averageSessionDuration: number;
  labels?: string[];
  data?: number[];
}

export interface ApiError {
  message: string;
  code?: number;
  details?: Record<string, any>;
}

export interface QueryError {
  message: string;
  status?: number;
  data?: any;
}

export interface ErrorProps {
  message: string;
  type?: 'inline' | 'page';
  retry?: () => void;
}

export interface ErrorPageProps {
  code: number;
  message: string;
}