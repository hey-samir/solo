export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
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
  averageGrade: string;
  rank: number;
}

export interface Stats {
  totalSends: number;
  averageGrade: string;
  bestGrade: string;
  totalSessions: number;
  averageSessionDuration: number;
}

export interface ErrorPageProps {
  code: number;
  message: string;
}
