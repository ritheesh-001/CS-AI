export type UserRole = 'CITIZEN' | 'AUTHORITY';

export type AppLanguage = 'en' | 'ta' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  officialId?: string;
  department?: string;
  designation?: string;
  language: AppLanguage;
  reportsSubmitted: number;
  criticalAlertsSent: number;
  isLoggedIn: boolean;
}
