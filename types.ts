
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  STAFF = 'STAFF'
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum EventType {
  OBSERVATION = 'OBSERVATION',
  MEETING = 'MEETING',
  CALL = 'CALL',
  FOLLOW_UP = 'FOLLOW_UP',
  RESOLUTION = 'RESOLUTION'
}

export interface Grade {
  id: string;
  name: string; // e.g. "5to A"
}

export interface Course {
  id: string;
  name: string;
  gradeId: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  gradeIds?: string[]; // For teachers
  courseIds?: string[]; // For teachers
  tutorGradeIds?: string[]; // For teachers who are tutors of specific grades
}

export interface Student {
  id: string;
  name: string;
  gradeId: string;
  courseIds: string[];
  parentContact: string;
}

export interface IncidentEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: string;
  authorId: string;
  authorName: string;
  agreements?: string; // For meetings
  reportGenerated?: boolean;
}

export interface Incident {
  id: string;
  title: string;
  type: string; // e.g., Academic, Behavioral, Bullying
  priority: IncidentPriority;
  status: IncidentStatus;
  studentId: string;
  reporterId: string;
  assignedToIds: string[]; // For derivations
  createdAt: string;
  deadline?: string;
  isSimple?: boolean;
  events: IncidentEvent[];
}
