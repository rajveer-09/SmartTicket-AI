
export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  skills?: string[];
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  user: User | string;
  assignedTo?: User | string;
  status: TicketStatus;
  priority?: Priority;
  category?: string;
  aiNotes?: string;
  requiredSkills?: string[];
  createdAt: string;
  updatedAt: string;
}
