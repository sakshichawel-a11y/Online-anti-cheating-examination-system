export type ViewMode = 'portal' | 'guide';

export type UserRole = 'student' | 'teacher' | 'invigilator' | 'admin';

export type PortalPage = 
  | 'landing'
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'profile'
  | 'system-check'
  | 'instructions' 
  | 'exam' 
  | 'result' 
  | 'history' 
  | 'teacher' 
  | 'invigilator' 
  | 'admin';

// 1. Relational Model: users
export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

// 2. Relational Model: students
export interface StudentProfile {
  id: number;
  user_id?: number;
  student_id?: string; // Roll number
  name: string;
  email: string;
  password?: string;
  rollNumber: string;
  prn?: string;
  mobile?: string;
  phone?: string;
  dob?: string;
  course?: string;
  department?: string; // Branch
  branch?: string;
  semester?: string;
  college?: string;
  avatarUrl?: string;
  referencePhoto?: string;
  verified?: boolean;
}

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  employeeCode: string;
  department: string;
  college: string;
  designation: string;
  assignedSubject: string;
  phone?: string;
  avatarUrl?: string;
}

export interface InvigilatorProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  employeeCode: string;
  department: string;
  college: string;
  roomAssigned: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  adminCode?: string;
  designation: string;
  college: string;
  accessLevel: 'SUPER_ADMIN' | 'CONTROLLER_OF_EXAMS' | 'DEAN_ACADEMICS';
  avatarUrl?: string;
}

export interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  idCode: string;
  department?: string;
  college?: string;
  avatarUrl?: string;
  createdAt?: string;
  details?: any;
}

// 4. Relational Model: questions
export interface QuestionData {
  id: number;
  examId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

export type ExamScheduleStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'DRAFT' | 'LOCKED';

// 3. Relational Model: exams
export interface ExamData {
  id: number;
  code: string;
  title: string;
  subject: string;
  department: string;
  semester: string;
  examDate: string;
  timeSlot: string;
  isToday: boolean;
  scheduleStatus: ExamScheduleStatus;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  registrationDeadline?: string;
  description: string;
  isPublished?: boolean;
  isResultPublished?: boolean;
  questions: QuestionData[];
}

// 5. Relational Model: registrations
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REGISTERED';

export interface ExamRegistration {
  id: number;
  studentId: number;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  examId: number;
  examTitle: string;
  examCode: string;
  registrationDate: string;
  status: RegistrationStatus;
  adminRemark?: string;
}

// 6. Relational Model: exam_attempts & 7. answers
export type QuestionStatus = 'not-visited' | 'current' | 'answered' | 'unanswered' | 'review';

export type ProctorAlertEventType =
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES_DETECTED'
  | 'CAMERA_DISABLED'
  | 'MICROPHONE_DISABLED'
  | 'TAB_SWITCH_DETECTED'
  | 'FULLSCREEN_EXIT'
  | 'WINDOW_BLUR_DETECTED'
  | 'AUDIO_NOISE_DETECTED'
  | 'TAB_SWITCH' 
  | 'WINDOW_BLUR'
  | 'RIGHT_CLICK_ATTEMPT'
  | 'CAMERA_MULTIPLE_FACES'
  | 'CAMERA_FACE_LOST'
  | 'CAMERA_OBSTRUCTION'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT';

export interface CheatingLogEvent {
  id: string;
  attemptId: number;
  eventType: ProctorAlertEventType;
  timestamp: string;
  description: string;
  warningNumber: number;
}

export interface ExamAttempt {
  id: number;
  studentId?: number;
  examId: number;
  examCode?: string;
  examTitle: string;
  subject: string;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime?: string;
  totalScore: number;
  percentage: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unansweredQuestions?: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'DISQUALIFIED';
  warningCount: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  cheatingLogs: CheatingLogEvent[];
  referenceSnapshot?: string;
}

// 8. Relational Model: anti_cheating_alerts
export type AlertSeverity = 'Low' | 'Medium' | 'High';
export type AlertReviewStatus = 'PENDING_REVIEW' | 'INVESTIGATED' | 'CLEARED' | 'PENALIZED';

export interface AntiCheatingAlert {
  id: string;
  attemptId: number;
  studentId: number;
  studentName: string;
  studentRoll: string;
  examId: number;
  examTitle: string;
  alertType: ProctorAlertEventType;
  severity: AlertSeverity;
  timestamp: string;
  occurrenceCount: number;
  reviewStatus: AlertReviewStatus;
  adminRemark?: string;
}

// Proctoring Real-time feeds for Invigilators
export interface CandidateLiveStatus {
  id: number;
  name: string;
  rollNumber: string;
  prn: string;
  examTitle: string;
  examCode: string;
  avatarUrl?: string;
  status: 'NORMAL' | 'WARNED' | 'CRITICAL' | 'TERMINATED';
  strikes: number;
  lastEvent: string;
  lastEventTime: string;
  cameraLive: boolean;
  micLive: boolean;
  faceDetected: boolean;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface ProctorAlert {
  id: string;
  timestamp: string;
  candidateName: string;
  rollNumber: string;
  eventType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GuidePart {
  id: number;
  partNumber: string;
  title: string;
  badge: string;
  summary: string;
  files?: {
    path: string;
    language: string;
    description: string;
    code: string;
  }[];
  diagrams?: {
    title: string;
    type: 'usecase' | 'dfd0' | 'dfd1' | 'er' | 'architecture';
    description: string;
  }[];
  contentSections: {
    heading: string;
    body: string;
    bullets?: string[];
  }[];
  vivaQuestions?: {
    question: string;
    answer: string;
  }[];
}
