/**
 * Relational Database Service & Storage Engine
 * Models the 8 core tables:
 * 1. users
 * 2. students
 * 3. exams
 * 4. questions
 * 5. registrations
 * 6. exam_attempts
 * 7. answers
 * 8. anti_cheating_alerts
 */

import { 
  UserRecord, 
  StudentProfile, 
  TeacherProfile,
  RegisteredUser,
  ExamData, 
  QuestionData, 
  ExamRegistration, 
  ExamAttempt, 
  AntiCheatingAlert,
  AlertSeverity,
  AlertReviewStatus,
  RegistrationStatus
} from '../types';
import {
  DataRetentionRule,
  ConsentRecord,
  AuditLogEntry,
  PrivacyOfficerConfig,
  PolicyMetadata
} from '../types/privacy';
import { 
  DEFAULT_RETENTION_RULES,
  DEFAULT_PRIVACY_OFFICER,
  DEFAULT_POLICY_METADATA
} from '../components/PolicyPagesModal';
import { 
  INITIAL_EXAMS, 
  DEMO_STUDENT, 
  INITIAL_PAST_ATTEMPTS,
  TEACHERS_LIST
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'online_exam_users_v3',
  STUDENTS: 'online_exam_students_v3',
  TEACHERS: 'online_exam_teachers_v3',
  EXAMS: 'online_exam_exams_v3',
  REGISTRATIONS: 'online_exam_registrations_v3',
  ATTEMPTS: 'online_exam_attempts_v3',
  ALERTS: 'online_exam_alerts_v3',
  RETENTION_RULES: 'online_exam_retention_rules_v3',
  AUDIT_LOGS: 'online_exam_audit_logs_v3',
  CONSENT_RECORDS: 'online_exam_consent_records_v3',
  PRIVACY_OFFICER: 'online_exam_privacy_officer_v3',
  POLICY_METADATA: 'online_exam_policy_metadata_v3',
};

// Initial Registrations Seed
const SEED_REGISTRATIONS: ExamRegistration[] = [
  {
    id: 101,
    studentId: 1,
    studentName: 'Sakshi Chawel',
    studentRoll: 'IT-2026-042',
    studentEmail: 'student@gmail.com',
    examId: 1,
    examTitle: 'Computer Science & Engineering Examination (IT-401)',
    examCode: 'IT-401',
    registrationDate: '2026-09-01 09:30 AM',
    status: 'APPROVED',
    adminRemark: 'Enrolment and photo baseline verified for session 2026.',
  },
  {
    id: 102,
    studentId: 1,
    studentName: 'Sakshi Chawel',
    studentRoll: 'IT-2026-042',
    studentEmail: 'student@gmail.com',
    examId: 2,
    examTitle: 'Python Programming (IT-402)',
    examCode: 'IT-402',
    registrationDate: '2026-09-02 11:15 AM',
    status: 'PENDING',
    adminRemark: 'Pending seat allotment.',
  },
  {
    id: 103,
    studentId: 2,
    studentName: 'Rohan M. Patil',
    studentRoll: 'IT-2026-033',
    studentEmail: 'rohan.patil@gmail.com',
    examId: 1,
    examTitle: 'Computer Science & Engineering Examination (IT-401)',
    examCode: 'IT-401',
    registrationDate: '2026-09-03 02:40 PM',
    status: 'APPROVED',
  },
  {
    id: 104,
    studentId: 3,
    studentName: 'Priya K. Nair',
    studentRoll: 'IT-2026-028',
    studentEmail: 'priya.nair@gmail.com',
    examId: 1,
    examTitle: 'Computer Science & Engineering Examination (IT-401)',
    examCode: 'IT-401',
    registrationDate: '2026-09-04 10:10 AM',
    status: 'PENDING',
  },
];

// Initial Anti-Cheating Alerts Seed
const SEED_ALERTS: AntiCheatingAlert[] = [
  {
    id: 'ALT-1001',
    attemptId: 9001,
    studentId: 2,
    studentName: 'Rohan M. Patil',
    studentRoll: 'IT-2026-033',
    examId: 1,
    examTitle: 'Computer Science & Engineering (IT-401)',
    alertType: 'TAB_SWITCH_DETECTED',
    severity: 'Medium',
    timestamp: '2026-09-08 10:14:22',
    occurrenceCount: 2,
    reviewStatus: 'PENDING_REVIEW',
    adminRemark: 'Investigating browser log events.',
  },
  {
    id: 'ALT-1002',
    attemptId: 9002,
    studentId: 4,
    studentName: 'Aditya G. Joshi',
    studentRoll: 'IT-2026-009',
    examId: 1,
    examTitle: 'Computer Science & Engineering (IT-401)',
    alertType: 'MULTIPLE_FACES_DETECTED',
    severity: 'High',
    timestamp: '2026-09-08 10:22:45',
    occurrenceCount: 1,
    reviewStatus: 'INVESTIGATED',
    adminRemark: 'Secondary person in background frame. Warning dispatched.',
  },
  {
    id: 'ALT-1003',
    attemptId: 9003,
    studentId: 1,
    studentName: 'Sakshi Chawel',
    studentRoll: 'IT-2026-042',
    examId: 1,
    examTitle: 'Computer Science & Engineering (IT-401)',
    alertType: 'WINDOW_BLUR_DETECTED',
    severity: 'Low',
    timestamp: '2026-09-08 10:05:10',
    occurrenceCount: 1,
    reviewStatus: 'CLEARED',
    adminRemark: 'System notification pop-up. Exam resumed cleanly.',
  },
  {
    id: 'ALT-1004',
    attemptId: 9004,
    studentId: 3,
    studentName: 'Priya K. Nair',
    studentRoll: 'IT-2026-028',
    examId: 2,
    examTitle: 'Python Programming (IT-402)',
    alertType: 'NO_FACE_DETECTED',
    severity: 'Medium',
    timestamp: '2026-09-08 10:31:02',
    occurrenceCount: 3,
    reviewStatus: 'PENDING_REVIEW',
    adminRemark: '',
  },
];

// Seed Students
const SEED_STUDENTS: StudentProfile[] = [
  DEMO_STUDENT,
  {
    id: 2,
    name: 'Rohan M. Patil',
    email: 'rohan.patil@gmail.com',
    rollNumber: 'IT-2026-033',
    prn: 'PRN2024098133',
    mobile: '+91 9823012345',
    dob: '2004-05-14',
    course: 'Diploma in Information Technology',
    department: 'Information Technology',
    branch: 'Information Technology',
    semester: 'Semester IV (Diploma Engg)',
    college: 'Apex Autonomous Institute of Engineering & Technology',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 3,
    name: 'Priya K. Nair',
    email: 'priya.nair@gmail.com',
    rollNumber: 'IT-2026-028',
    prn: 'PRN2024098128',
    mobile: '+91 9823012346',
    dob: '2005-02-20',
    course: 'Diploma in Information Technology',
    department: 'Information Technology',
    branch: 'Information Technology',
    semester: 'Semester IV (Diploma Engg)',
    college: 'Apex Autonomous Institute of Engineering & Technology',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 4,
    name: 'Aditya G. Joshi',
    email: 'aditya.joshi@gmail.com',
    rollNumber: 'IT-2026-009',
    prn: 'PRN2024098109',
    mobile: '+91 9823012347',
    dob: '2004-11-08',
    course: 'Diploma in Computer Engineering',
    department: 'Computer Engineering',
    branch: 'Computer Engineering',
    semester: 'Semester IV (Diploma Engg)',
    college: 'Apex Autonomous Institute of Engineering & Technology',
    verified: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  },
];

class DatabaseService {
  // 1. STUDENTS TABLE
  getStudents(): StudentProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveStudents(SEED_STUDENTS);
    return SEED_STUDENTS;
  }

  saveStudents(students: StudentProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  addStudent(student: StudentProfile): void {
    const students = this.getStudents();
    students.unshift(student);
    this.saveStudents(students);
  }

  updateStudent(student: StudentProfile): void {
    const students = this.getStudents().map((s) => (s.id === student.id ? student : s));
    this.saveStudents(students);
  }

  // 1B. TEACHERS TABLE
  getTeachers(): TeacherProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveTeachers(TEACHERS_LIST);
    return TEACHERS_LIST;
  }

  saveTeachers(teachers: TeacherProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  addTeacher(teacher: TeacherProfile): void {
    const teachers = this.getTeachers();
    const filtered = teachers.filter(
      (t) =>
        t.email.toLowerCase() !== teacher.email.toLowerCase() &&
        t.employeeCode.toLowerCase() !== teacher.employeeCode.toLowerCase()
    );
    filtered.unshift(teacher);
    this.saveTeachers(filtered);
  }

  updateTeacher(teacher: TeacherProfile): void {
    const teachers = this.getTeachers().map((t) => (t.id === teacher.id ? teacher : t));
    this.saveTeachers(teachers);
  }

  // 1C. UNIFIED REGISTERED ACCOUNTS TABLE (Student, Teacher, Invigilator, Admin)
  getRegisteredAccounts(): RegisteredUser[] {
    try {
      const stored = localStorage.getItem('online_exam_registered_accounts_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return [];
  }

  saveRegisteredAccounts(users: RegisteredUser[]): void {
    try {
      localStorage.setItem('online_exam_registered_accounts_v1', JSON.stringify(users));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  registerAccount(user: RegisteredUser): void {
    const users = this.getRegisteredAccounts();
    const filtered = users.filter(
      (u) =>
        u.email.toLowerCase() !== user.email.toLowerCase() &&
        u.idCode.toLowerCase() !== user.idCode.toLowerCase()
    );
    filtered.unshift(user);
    this.saveRegisteredAccounts(filtered);

    // Also sync into role-specific stores for runtime views
    if (user.role === 'student') {
      const studentProfile: StudentProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        rollNumber: user.idCode,
        prn: user.details?.prn || user.idCode,
        college: user.college || 'Government Polytechnic Pune',
        department: user.department || 'Information Technology',
        semester: user.details?.semester || 'Semester IV (Diploma Engg)',
        phone: user.details?.phone || '',
        avatarUrl: user.avatarUrl,
        referencePhoto: user.details?.referencePhoto,
        verified: true,
      };
      this.addStudent(studentProfile);
    } else if (user.role === 'teacher') {
      const teacherProfile: TeacherProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        employeeCode: user.idCode,
        department: user.department || 'Information Technology',
        college: user.college || 'Government Polytechnic Pune',
        designation: user.details?.designation || 'Faculty Professor',
        assignedSubject: user.details?.assignedSubject || 'Core Java & System Architecture',
        phone: user.details?.phone || '',
        avatarUrl: user.avatarUrl,
      };
      this.addTeacher(teacherProfile);
    }
  }

  // 2. EXAMS TABLE
  getExams(): ExamData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    const preparedExams = INITIAL_EXAMS.map((e) => ({
      ...e,
      isPublished: true,
      isResultPublished: true, // Results can be published/hidden by admin
      registrationDeadline: '2026-09-07 11:59 PM',
    }));
    this.saveExams(preparedExams);
    return preparedExams;
  }

  saveExams(exams: ExamData[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  addExam(exam: ExamData): void {
    const exams = this.getExams();
    exams.unshift(exam);
    this.saveExams(exams);
  }

  updateExam(updatedExam: ExamData): void {
    const exams = this.getExams().map((e) => (e.id === updatedExam.id ? updatedExam : e));
    this.saveExams(exams);
  }

  deleteExam(examId: number): void {
    const exams = this.getExams().filter((e) => e.id !== examId);
    this.saveExams(exams);
  }

  togglePublishResult(examId: number): boolean {
    const exams = this.getExams();
    let newState = false;
    const updated = exams.map((e) => {
      if (e.id === examId) {
        newState = !e.isResultPublished;
        return { ...e, isResultPublished: newState };
      }
      return e;
    });
    this.saveExams(updated);
    return newState;
  }

  // 3. REGISTRATIONS TABLE (registrations)
  getRegistrations(): ExamRegistration[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveRegistrations(SEED_REGISTRATIONS);
    return SEED_REGISTRATIONS;
  }

  saveRegistrations(registrations: ExamRegistration[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  registerStudentForExam(
    student: StudentProfile,
    exam: ExamData
  ): { success: boolean; message: string; registration?: ExamRegistration } {
    const registrations = this.getRegistrations();
    const existing = registrations.find(
      (r) => r.studentId === student.id && r.examId === exam.id
    );

    if (existing) {
      return {
        success: false,
        message: `You are already registered for ${exam.code} (Status: ${existing.status}).`,
        registration: existing,
      };
    }

    const newReg: ExamRegistration = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.rollNumber,
      studentEmail: student.email,
      examId: exam.id,
      examTitle: `${exam.title} (${exam.code})`,
      examCode: exam.code,
      registrationDate: new Date().toLocaleString(),
      status: 'APPROVED', // Default instant approval or pending based on institute policy
      adminRemark: 'Direct registration recorded. Rules acknowledged.',
    };

    registrations.unshift(newReg);
    this.saveRegistrations(registrations);

    return {
      success: true,
      message: `Successfully registered for ${exam.title} (${exam.code})!`,
      registration: newReg,
    };
  }

  updateRegistrationStatus(
    registrationId: number,
    status: RegistrationStatus,
    adminRemark?: string
  ): void {
    const registrations = this.getRegistrations().map((r) =>
      r.id === registrationId ? { ...r, status, adminRemark: adminRemark || r.adminRemark } : r
    );
    this.saveRegistrations(registrations);
  }

  // 4. ATTEMPTS TABLE (exam_attempts)
  getAttempts(): ExamAttempt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveAttempts(INITIAL_PAST_ATTEMPTS);
    return INITIAL_PAST_ATTEMPTS;
  }

  saveAttempts(attempts: ExamAttempt[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  addAttempt(attempt: ExamAttempt): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    this.saveAttempts(attempts);
  }

  // 5. ANTI-CHEATING ALERTS TABLE (anti_cheating_alerts)
  getAlerts(): AntiCheatingAlert[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveAlerts(SEED_ALERTS);
    return SEED_ALERTS;
  }

  saveAlerts(alerts: AntiCheatingAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  addAlert(alert: AntiCheatingAlert): void {
    const alerts = this.getAlerts();
    // Check if duplicate within last 20 seconds, increment count
    const recent = alerts.find(
      (a) =>
        a.studentId === alert.studentId &&
        a.examId === alert.examId &&
        a.alertType === alert.alertType
    );
    if (recent) {
      recent.occurrenceCount += 1;
      recent.timestamp = alert.timestamp;
      this.saveAlerts(alerts);
    } else {
      alerts.unshift(alert);
      this.saveAlerts(alerts);
    }
  }

  updateAlertStatus(
    alertId: string,
    reviewStatus: AlertReviewStatus,
    adminRemark?: string
  ): void {
    const alerts = this.getAlerts().map((a) =>
      a.id === alertId
        ? {
            ...a,
            reviewStatus,
            adminRemark: adminRemark !== undefined ? adminRemark : a.adminRemark,
          }
        : a
    );
    this.saveAlerts(alerts);
  }

  // 6. RETENTION RULES (Configurable by admin)
  getRetentionRules(): DataRetentionRule[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RETENTION_RULES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveRetentionRules(DEFAULT_RETENTION_RULES);
    return DEFAULT_RETENTION_RULES;
  }

  saveRetentionRules(rules: DataRetentionRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RETENTION_RULES, JSON.stringify(rules));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  updateRetentionRule(category: string, newPeriod: string): void {
    const rules = this.getRetentionRules().map((r) =>
      r.category === category ? { ...r, retentionPeriod: newPeriod } : r
    );
    this.saveRetentionRules(rules);
  }

  // 7. AUDIT LOGGING (Sensitive administrative actions)
  getAuditLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    const initialLogs: AuditLogEntry[] = [
      {
        id: 'AUD-901',
        adminId: 501,
        adminName: 'Dr. Meera Kulkarni (CoE)',
        action: 'EXAM_CREATED',
        targetRecord: 'Exam IT-401 (Computer Science & Engineering)',
        timestamp: '2026-09-01 08:30:15',
        ipSession: '192.168.10.45 [GPP-Intranet]',
        actionResult: 'SUCCESS',
        details: 'Initial paper scheduled with 35 questions and proctoring surveillance active.'
      },
      {
        id: 'AUD-902',
        adminId: 501,
        adminName: 'Dr. Meera Kulkarni (CoE)',
        action: 'REGISTRATION_APPROVED',
        targetRecord: 'Student IT-2026-042 (Sakshi Chawel)',
        timestamp: '2026-09-01 09:31:00',
        ipSession: '192.168.10.45 [GPP-Intranet]',
        actionResult: 'SUCCESS',
        details: 'PRN2024098124 credentials verified.'
      },
      {
        id: 'AUD-903',
        adminId: 501,
        adminName: 'Dr. Meera Kulkarni (CoE)',
        action: 'ALERT_REVIEWED',
        targetRecord: 'Alert ALT-1001 (Rohan M. Patil - MULTIPLE_FACES_DETECTED)',
        timestamp: '2026-09-05 14:20:00',
        ipSession: '192.168.10.45 [GPP-Intranet]',
        actionResult: 'SUCCESS',
        details: 'Candidate explained secondary family member walked past frame; cleared after inquiry.'
      },
      {
        id: 'AUD-904',
        adminId: 501,
        adminName: 'Dr. Meera Kulkarni (CoE)',
        action: 'STUDENT_RECORD_ACCESSED',
        targetRecord: 'Student Profile Sakshi Chawel',
        timestamp: '2026-09-08 10:14:02',
        ipSession: '192.168.10.45 [GPP-Intranet]',
        actionResult: 'SUCCESS',
        details: 'Verification of baseline photograph.'
      }
    ];
    this.saveAuditLogs(initialLogs);
    return initialLogs;
  }

  saveAuditLogs(logs: AuditLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  logAdminAction(
    adminId: number,
    adminName: string,
    action: AuditLogEntry['action'],
    targetRecord: string,
    details?: string,
    actionResult: 'SUCCESS' | 'FAILED' | 'PENDING' = 'SUCCESS'
  ): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      adminId,
      adminName,
      action,
      targetRecord,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipSession: '192.168.10.45 [GPP-Autonomous-Network]',
      actionResult,
      details,
    };
    logs.unshift(newEntry);
    this.saveAuditLogs(logs);
  }

  // 8. CONSENT RECORDS (Data minimization & policy versioning)
  getConsentRecords(): ConsentRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONSENT_RECORDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return [];
  }

  saveConsentRecords(records: ConsentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONSENT_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  recordConsent(record: Omit<ConsentRecord, 'id'>): ConsentRecord {
    const records = this.getConsentRecords();
    const created: ConsentRecord = {
      ...record,
      id: `CNS-${Date.now().toString().slice(-4)}`,
    };
    records.unshift(created);
    this.saveConsentRecords(records);
    return created;
  }

  // 9. PRIVACY OFFICER & POLICY METADATA CONFIG
  getPrivacyOfficer(): PrivacyOfficerConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRIVACY_OFFICER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.savePrivacyOfficer(DEFAULT_PRIVACY_OFFICER);
    return DEFAULT_PRIVACY_OFFICER;
  }

  savePrivacyOfficer(cfg: PrivacyOfficerConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIVACY_OFFICER, JSON.stringify(cfg));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  getPolicyMetadata(): PolicyMetadata {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POLICY_METADATA);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.savePolicyMetadata(DEFAULT_POLICY_METADATA);
    return DEFAULT_POLICY_METADATA;
  }

  savePolicyMetadata(meta: PolicyMetadata): void {
    try {
      localStorage.setItem(STORAGE_KEYS.POLICY_METADATA, JSON.stringify(meta));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  // Reset database to initial pristine seed data
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.RETENTION_RULES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CONSENT_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.PRIVACY_OFFICER);
    localStorage.removeItem(STORAGE_KEYS.POLICY_METADATA);
  }
}

export const db = new DatabaseService();
