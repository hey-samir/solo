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

export interface ErrorProps {
  message: string;
  type?: 'inline' | 'page';
  retry?: () => void;
}

export interface ErrorResponse extends Error {
  code?: number;
  status?: number;
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
}

export interface ErrorPageProps {
  code: number;
  message: string;
}