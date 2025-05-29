
export type Theme = 'light' | 'dark';

export enum Mood {
  Happy = 'Happy',
  Sad = 'Sad',
  Anxious = 'Anxious',
  Calm = 'Calm',
  Neutral = 'Neutral',
  Excited = 'Excited',
  Stressed = 'Stressed',
  Grateful = 'Grateful' // Can be used as a mood for Journal
}

export interface MoodEntry { // For Journal feature
  id: string;
  userId: string;
  date: string; // ISO string
  mood: Mood;
  text: string;
  aiReflection?: string; // Optional AI analysis
}

export interface ChatMessage {
  id:string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

// For mock dashboard data
export interface MoodTrendData {
  date: string;
  moodScore: number; // e.g., Happy=5, Neutral=3, Sad=1
}

export interface AcademicData { // Used in Dashboard Snapshot
  metric: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
}

// --- New Types for Academic Performance View ---
export interface SubjectGrade {
  id: string;
  name: string;
  grade: number; // Percentage or score
  term: string; // e.g., "Fall 2023", "Spring 2024"
  credits?: number;
}

export interface OverallPerformance {
  gpa: number;
  totalCredits: number;
  alerts: string[];
}

// --- Updated Types for Assignment Feature ---
export interface Assignment {
  id: string;
  title: string;
  dueDate: string; // ISO string
  instituteName: string; // Added: To scope assignments
  createdBy: string; // Added: Admin User ID
  createdAt: string; // Added: ISO string timestamp
}

export interface StudentAssignmentSubmission {
  id: string; // Unique ID for the submission record
  assignmentId: string;
  studentId: string;
  instituteName: string;
  submittedAt: string; // ISO string timestamp of when student marked as submitted
  status: 'On-Time' | 'Late'; // Calculated at time of submission
}

// For displaying assignments to students, including their specific submission status
export interface StudentDisplayableAssignment extends Assignment {
  studentSubmissionStatus: 'Pending' | 'On-Time' | 'Late' | 'Missed';
  studentSubmittedAt?: string; // When the student submitted this specific assignment
}

// For student assignment notifications
export interface AssignmentAlert {
  id: string; // Unique ID for the alert
  assignmentId: string;
  title: string; // Assignment title for quick reference in alert
  message: string;
  type: 'warning' | 'info' | 'success' | 'error'; // For styling alerts
  dueDate?: string; // Optional, for upcoming alerts
}

// AssignmentStats is removed as stats will be derived dynamically.

export enum UserType {
  Student = 'Student',
  Admin = 'Admin' 
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; 
  userType: UserType;
  instituteName: string; 
  isActivated?: boolean; 
  isPreRegisteredByAdmin?: boolean; 
}

export interface CurrentUser extends Omit<User, 'password'> { 
}


export interface SubscriptionTier {
  name: string;
  price?: string; 
  students: string;
  features: string[];
  highlight?: boolean;
}

export interface AddStudentFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SignupFormData { 
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  userType: UserType;
  instituteName: string; 
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; 
}

export interface AdminInstituteAcademicStats {
  totalStudents: number;
  assignmentsOnTimePercent: number;
  assignmentsLatePercent: number;
  assignmentsMissedPercent: number;
}

export interface AdminAcademicInsights {
  academicPressureAnalysis: string;
  studentRetentionTips: string[];
}

// --- New Types for Admin Dashboard Analytics ---
export interface StudentAttitudeStats {
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number; // Added for completeness
  analyzedStudentCount: number; // Number of students with enough journal data
  totalStudentsInInstitute: number;
}

export interface DropoutRiskAnalysis {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Unavailable';
  analysisText: string;
  contributingFactors: string[];
  proactiveSuggestions: string[];
}

export interface AdminDashboardData {
  attitudeStats?: StudentAttitudeStats;
  dropoutRisk?: DropoutRiskAnalysis;
  // other admin-specific dashboard data can be added here
}
