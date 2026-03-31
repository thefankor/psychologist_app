export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  firstSession: string;
  status: 'active' | 'inactive' | 'completed';
  notes: string;
  totalSessions: number;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  type: 'initial' | 'regular' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface Note {
  id: string;
  clientId: string;
  sessionId?: string;
  content: string;
  date: string;
  private: boolean;
}

export interface WorkingDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkingHours {
  id: string;
  schedule: WorkingDay[];
  effectiveFrom: string;
  notes?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}