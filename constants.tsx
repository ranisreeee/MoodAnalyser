
import { MoodType, User, UserRole } from './types';

export const MOCK_STUDENTS: User[] = [
  { id: 's1', email: 'student@example.com', name: 'Alex Johnson', role: UserRole.STUDENT, branch: 'Computer Science', vouchedBy: 'CS-LEADER-101' },
];

export const MOCK_LEADERS: User[] = [
  { id: 'l1', email: 'leader@example.com', name: 'Dr. Emily Carter', role: UserRole.LEADER, branch: 'Computer Science', referralCode: 'CS-LEADER-101' }
];

export const MOOD_COLORS: Record<MoodType, string> = {
  Happy: 'bg-yellow-400',
  Stressed: 'bg-red-500',
  Anxious: 'bg-orange-400',
  Sad: 'bg-blue-500',
  Neutral: 'bg-gray-400',
  Calm: 'bg-emerald-400'
};

export const MOOD_EMOJIS: Record<MoodType, string> = {
  Happy: '😊',
  Stressed: '😫',
  Anxious: '😰',
  Sad: '😢',
  Neutral: '😐',
  Calm: '😌'
};
