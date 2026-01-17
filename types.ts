
export enum UserRole {
  STUDENT = 'STUDENT',
  LEADER = 'LEADER'
}

export type MoodType = 'Happy' | 'Stressed' | 'Anxious' | 'Sad' | 'Neutral' | 'Calm';

export interface UserSettings {
  checkInFrequency: 'Daily' | 'Weekly' | 'Bi-weekly';
  preferredTime: string; // HH:mm format
}

export interface MoodRecord {
  id: string;
  studentId: string;
  timestamp: string;
  mood: MoodType;
  input: string;
  rating: number; // 1-5 scale
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
  settings?: UserSettings;
  referralCode?: string; // For Leaders
  vouchedBy?: string;   // For Students: holds the referralCode of the leader
}

export interface Song {
  title: string;
  artist: string;
  mood: MoodType;
  id: string;
}

export interface AnalysisResult {
  mood: MoodType;
  explanation: string;
  recommendations: { 
    title: string; 
    artist: string;
    youtubeUrl?: string;
  }[];
}
