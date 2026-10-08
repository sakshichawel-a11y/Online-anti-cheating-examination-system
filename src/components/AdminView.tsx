import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Award, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  School,
  FileCheck,
  Eye,
  RefreshCw,
  TrendingUp,
  UserCheck,
  EyeOff,
  Filter,
  Check,
  MessageSquare,
  Sparkles,
  Printer,
  Database,
  History as HistoryIcon,
  Scale,
  Building2,
  Lock
} from 'lucide-react';
import { 
  AdminProfile, 
  ExamData, 
  ProctorAlert, 
  StudentProfile, 
  ExamAttempt,
  ExamRegistration,
  AntiCheatingAlert,
  AlertSeverity,
  AlertReviewStatus,
  RegistrationStatus
} from '../types';
import { 
  DataRetentionRule,
  AuditLogEntry,
  PrivacyOfficerConfig,
  PolicyMetadata
} from '../types/privacy';
import { db } from '../data/db';
import { PROFESSORS_LIST } from '../data/mockData';

interface AdminViewProps {
  admin: AdminProfile;
  exams: ExamData[];
  alerts: AntiCheatingAlert[];
  students: StudentProfile[];
  registrations: ExamRegistration[];
  attempts?: ExamAttempt[];
  onReviewAttempt?: (attempt: ExamAttempt) => void;
  onAddExam?: (newExam: ExamData) => void;
  onUpdateExam?: (exam: ExamData) => void;
  onDeleteExam?: (examId: number) => void;
  onUpdateRegistrationStatus?: (registrationId: number, status: RegistrationStatus, remark?: string) => void;
  onUpdateAlertStatus?: (alertId: string, status: AlertReviewStatus, remark?: string) => void;
  onTogglePublishResult?: (examId: number) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  admin,
  exams: initialExams,
  alerts: initialAlerts,
  students: initialStudents,
  registrations: initialRegistrations,
  attempts = [],
  onReviewAttempt,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onUpdateRegistrationStatus,
  onUpdateAlertStatus,
  onTogglePublishResult,
}) => {
  const [activeTab, setActiveTab] = useState<
    'EXAMS' | 'STUDENTS' | 'REGISTRATIONS' | 'ALERTS' | 'RESULTS' | 'FACULTY' | 'RETENTION' | 'AUDIT_LOGS' | 'OFFICER'
  >('EXAMS');

  const [exams, setExams] = useState<ExamData[]>(initialExams);
  const [alerts, setAlerts] = useState<AntiCheatingAlert[]>(initialAlerts);
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Requirements 25, 27, 28, 30 State
  const [retentionRules, setRetentionRules] = useState<DataRetentionRule[]>(() => db.getRetentionRules());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => db.getAuditLogs());
  const [privacyOfficer, setPrivacyOfficer] = useState<PrivacyOfficerConfig>(() => db.getPrivacyOfficer());
  const [policyMetadata, setPolicyMetadata] = useState<PolicyMetadata>(() => db.getPolicyMetadata());
  const [editingRetentionCategory, setEditingRetentionCategory] = useState<string | null>(null);
  const [editingRetentionPeriod, setEditingRetentionPeriod] = useState<string>('');

  // New Exam Modal state
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDept, setNewExamDept] = useState('Information Technology');
  const [newExamSem, setNewExamSem] = useState('Semester IV');
  const [newExamDate, setNewExamDate] = useState('Sept 10, 2026');
  const [newExamTimeSlot, setNewExamTimeSlot] = useState('11:00 AM – 12:30 PM');
  const [newExamDuration, setNewExamDuration] = useState(35);
  const [newExamTotalMarks, setNewExamTotalMarks] = useState(35);
  const [newExamPassingMarks, setNewExamPassingMarks] = useState(14);
  const [newExamDeadline, setNewExamDeadline] = useState('2026-09-09 11:59 PM');

  // Alert Remark Modal state
  const [selectedAlertForRemark, setSelectedAlertForRemark] = useState<AntiCheatingAlert | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [remarkStatus, setRemarkStatus] = useState<AlertReviewStatus>('INVESTIGATED');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state if props change
  React.useEffect(() => {
    setExams(initialExams);
  }, [initialExams]);

  React.useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  React.useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamCode.trim()) {
      showToast('Please provide exam title and paper code.');
      return;
    }

    const created: ExamData = {
      id: Date.now(),
      code: newExamCode.toUpperCase().trim(),
      title: newExamTitle.trim(),
      subject: newExamSubject.trim() || newExamTitle.trim(),
      department: newExamDept,
      semester: newExamSem,
      examDate: newExamDate,
      timeSlot: newExamTimeSlot,
      isToday: false,
      scheduleStatus: 'UPCOMING',
      totalQuestions: 5,
      durationMinutes: Number(newExamDuration),
      totalMarks: Number(newExamTotalMarks),
      passingMarks: Number(newExamPassingMarks),
      registrationDeadline: newExamDeadline,
      description: `Official autonomous examination paper for ${newExamDept} (${newExamSem}). Monitored with AI anti-cheating surveillance.`,
      isPublished: true,
      isResultPublished: true,
      questions: [
        {
          id: 101,
          examId: Date.now(),
          questionText: `Core Architectural Principles in ${newExamTitle}: Identify the primary requirement.`,
          optionA: 'Option A (Correct Specification)',
          optionB: 'Option B (Secondary Component)',
          optionC: 'Option C (Alternative Model)',
          optionD: 'Option D (Unused Structure)',
          correctOption: 'A',
          marks: 1,
        },
      ],
    };

    setExams([created, ...exams]);
    if (onAddExam) onAddExam(created);
    setShowNewExamModal(false);
    showToast(`Exam ${created.code} scheduled and published successfully.`);

    // Reset modal
    setNewExamTitle('');
    setNewExamCode('');
    setNewExamSubject('');
  };

  // Delete Exam
  const handleDeleteExam = (examId: number) => {
    if (window.confirm('Are you sure you want to remove this examination paper?')) {
      setExams(exams.filter((e) => e.id !== examId));
      if (onDeleteExam) onDeleteExam(examId);
      showToast('Examination paper removed.');
    }
  };

  // Toggle publish result
  const handleToggleResult = (examId: number) => {
    if (onTogglePublishResult) {
      onTogglePublishResult(examId);
    }
    setExams(
      exams.map((e) => (e.id === examId ? { ...e, isResultPublished: !e.isResultPublished } : e))
    );
    showToast('Result release status updated.');
  };

  // Registration approval
  const handleRegistrationAction = (regId: number, status: RegistrationStatus) => {
    if (onUpdateRegistrationStatus) {
      onUpdateRegistrationStatus(regId, status, `Decision recorded by ${admin.name}.`);
    }
    setRegistrations(
      registrations.map((r) => (r.id === regId ? { ...r, status } : r))
    );
    showToast(`Registration #${regId} marked as ${status}.`);
  };

  // Save Alert Remark
  const handleSaveAlertRemark = () => {
    if (!selectedAlertForRemark) return;
    if (onUpdateAlertStatus) {
      onUpdateAlertStatus(selectedAlertForRemark.id, remarkStatus, remarkInput);
    }
    setAlerts(
      alerts.map((a) =>
        a.id === selectedAlertForRemark.id
          ? { ...a, reviewStatus: remarkStatus, adminRemark: remarkInput }
          : a
      )
    );
    showToast(`Alert ${selectedAlertForRemark.id} reviewed.`);
    setSelectedAlertForRemark(null);
    setRemarkInput('');
  };

  // Export CSV Audit Report
  const handleExportAuditLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Alert ID,Timestamp,Student,Roll Number,Exam,Alert Type,Severity,Occurrences,Status,Remark\n' +
      alerts
        .map(
          (a) =>
            `"${a.id}","${a.timestamp}","${a.studentName}","${a.studentRoll}","${a.examTitle}","${a.alertType}","${a.severity}","${a.occurrenceCount}","${a.reviewStatus}","${(a.adminRemark || '').replace(/"/g, '""')}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `anti_cheating_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Forensic audit report exported as CSV.');
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.alertType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={admin.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                alt={admin.name}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-blue-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-1.5">
                <School className="w-3.5 h-3.5 text-blue-400" />
                <span>Office of the Controller of Examinations &bull; Apex Autonomous Institute</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {admin.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {admin.designation} &bull; <span className="text-amber-400 font-bold">{admin.accessLevel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowNewExamModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Exam</span>
            </button>
            <button
              onClick={handleExportAuditLogs}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit CSV</span>
            </button>
          </div>
        </div>

        {/* High-Level Institutional Statistics (Section 10) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-slate-200">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Students</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{students.length}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Exams</span>
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{exams.length}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold flex items-center justify-between">
              <span>Registered Students</span>
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-400 mt-1">{registrations.length}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
              <span>Active Exams</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {exams.filter((e) => e.scheduleStatus === 'ACTIVE').length}
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold flex items-center justify-between">
              <span>Completed Papers</span>
              <Award className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1">{attempts.length}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
              <span>Cheating Alerts</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{alerts.length}</div>
          </div>
        </div>

      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('EXAMS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'EXAMS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Exam Management ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTRATIONS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'REGISTRATIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Registrations Approvals ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'STUDENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Registry ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'ALERTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Anti-Cheating Monitoring Alerts ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'RESULTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Results Publishing & Reports ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'FACULTY'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Proctor Assignments (6 Professors)</span>
        </button>

        <button
          onClick={() => setActiveTab('RETENTION')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'RETENTION'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-teal-600" />
          <span>Data Retention Policy ({retentionRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HistoryIcon className="w-4 h-4 text-indigo-600" />
          <span>Administrative Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFICER')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'OFFICER'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Privacy & Grievance Config</span>
        </button>
      </div>

      {/* TAB 1: EXAM MANAGEMENT */}
      {activeTab === 'EXAMS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                      {exam.code}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {exam.scheduleStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{exam.subject}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Exam Date</span>
                      <strong className="text-slate-800">{exam.examDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Slot</span>
                      <strong className="text-slate-800">{exam.timeSlot}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                      <strong className="text-slate-800">{exam.durationMinutes} Mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                      <strong className="text-slate-800">{exam.questions.length} (35 Max)</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span>Result Release Status:</span>
                    <button
                      onClick={() => handleToggleResult(exam.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                        exam.isResultPublished !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {exam.isResultPublished !== false ? 'PUBLISHED' : 'HIDDEN'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Total Marks: {exam.totalMarks}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Exam Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATION APPROVALS (Section 10) */}
      {activeTab === 'REGISTRATIONS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Student Examination Enrolment Approvals
                </h3>
                <p className="text-xs text-slate-500">
                  Verify student registrations, approve examination eligibility, or reject enrolments.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {registrations.length} Total Registrations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Registration ID</th>
                    <th className="p-3.5">Candidate Details</th>
                    <th className="p-3.5">Target Examination</th>
                    <th className="p-3.5">Enrolment Date</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-600">
                        #{reg.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{reg.studentName}</div>
                        <div className="text-[11px] text-slate-500">Roll: {reg.studentRoll} &bull; {reg.studentEmail}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{reg.examTitle}</div>
                        <div className="text-[11px] text-blue-600 font-mono">{reg.examCode}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{reg.registrationDate}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            reg.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRegistrationAction(reg.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRegistrationAction(reg.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT REGISTRY */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Enrolled Candidate Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Master registry of students eligible for autonomous online assessments.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {students.length} Candidates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Roll & PRN</th>
                    <th className="p-3.5">Course & Branch</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5 text-center">Biometrics</th>
                    <th className="p-3.5">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={st.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-500">{st.college || 'Apex Autonomous'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">{st.rollNumber}</div>
                        <div className="text-[11px] font-mono text-slate-500">{st.prn || 'PRN2024098124'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{st.course || 'Diploma Engg'}</div>
                        <div className="text-[11px] text-slate-500">{st.department || 'Information Technology'}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{st.semester || 'Semester IV'}</td>
                      <td className="p-3.5 text-center">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          PHOTO VERIFIED
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{st.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANTI-CHEATING MONITORING ALERTS (Section 10) */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          {/* Requirement 24: Anti-Cheating Alert Disclaimer */}
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-900 font-bold text-sm">Mandatory Legal & Academic Protocol Disclaimer:</strong>
              <p className="leading-relaxed">
                Important: Anti-cheating alerts are indicators for review and should not automatically be treated as proof of academic misconduct. Authorized examination personnel should review relevant evidence and apply applicable examination rules before taking any action. The system does not automatically penalize or cancel an examination solely based on an automated detection.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Anti-Cheating Forensic Activity Stream</span>
              </h3>
              <p className="text-xs text-slate-500">
                Logged suspicious events from continuous webcam, mic, fullscreen, and tab monitoring. Review and attach administrative remarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Severity Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                {(['ALL', 'Low', 'Medium', 'High'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                      severityFilter === sev
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportAuditLogs}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Alert ID</th>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Exam</th>
                    <th className="p-3.5">Alert Event Type</th>
                    <th className="p-3.5 text-center">Severity</th>
                    <th className="p-3.5 text-center">Occurrences</th>
                    <th className="p-3.5 text-center">Review Status</th>
                    <th className="p-3.5">Admin Remark</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAlerts.map((alt) => (
                    <tr key={alt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-500">
                        {alt.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{alt.studentName}</div>
                        <div className="text-[11px] text-slate-500">{alt.studentRoll}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{alt.examTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{alt.timestamp}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {alt.alertType}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            alt.severity === 'High'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : alt.severity === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {alt.occurrenceCount}x
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            alt.reviewStatus === 'CLEARED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : alt.reviewStatus === 'INVESTIGATED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alt.reviewStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-[200px] truncate text-[11px]">
                        {alt.adminRemark || <span className="text-slate-400 italic">No remark attached</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedAlertForRemark(alt);
                            setRemarkInput(alt.adminRemark || '');
                            setRemarkStatus(alt.reviewStatus);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Review & Remark
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESULTS PUBLISHING & REPORTS (Section 11) */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Examination Results Management & Publishing
              </h3>
              <p className="text-xs text-slate-500">
                Automated scores computed by answer evaluation matrix. Students can only inspect their scorecards when published.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                Total Submissions: {attempts.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Attempt ID</th>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5 text-center">Score / Total</th>
                    <th className="p-3.5 text-center">Percentage</th>
                    <th className="p-3.5 text-center">Cheating Strikes</th>
                    <th className="p-3.5 text-center">Result Status</th>
                    <th className="p-3.5">Submission Time</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((att) => {
                    const isPass = att.totalScore >= att.passingMarks;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-600">
                          #{att.id.toString().slice(-6)}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">Sakshi Chawel</div>
                          <div className="text-[11px] text-slate-500">Roll: IT-2026-042</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{att.examTitle}</div>
                          <div className="text-[11px] text-slate-500">{att.subject}</div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-sm text-slate-900">
                          {att.totalScore} / {att.totalMarks}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                              isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              att.warningCount === 0
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.warningCount} strikes
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              att.status === 'DISQUALIFIED'
                                ? 'bg-red-600 text-white'
                                : isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.status === 'DISQUALIFIED' ? 'DISQUALIFIED' : isPass ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          {att.startTime}
                        </td>
                        <td className="p-3.5 text-right">
                          {onReviewAttempt && (
                            <button
                              onClick={() => onReviewAttempt(att)}
                              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                            >
                              Inspect &rarr;
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FACULTY ASSIGNMENTS */}
      {activeTab === 'FACULTY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFESSORS_LIST.map((fac, i) => (
              <div key={fac.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img src={fac.avatarUrl} alt={fac.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{fac.name}</h4>
                    <div className="text-xs font-mono text-blue-600">{fac.employeeCode}</div>
                    <div className="text-[11px] text-slate-500 truncate">{fac.department}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="text-slate-500 font-medium">Assigned Surveillance Hall:</div>
                  <div className="font-bold text-slate-800">{fac.roomAssigned}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DATA RETENTION SCHEDULE (Requirement 25) */}
      {activeTab === 'RETENTION' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <span>Admin-Configurable Data Retention Schedule (Requirement 25)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Define the institutional retention period for every data category. Periods are not hard-coded and can be tailored to Autonomous Institute policy.
              </p>
            </div>
            <button
              onClick={() => {
                db.saveRetentionRules(retentionRules);
                db.logAdminAction(
                  admin.id,
                  admin.name,
                  'RETENTION_POLICY_UPDATED',
                  'Institutional Data Retention Rules',
                  'Administrator adjusted retention lifecycle periods.'
                );
                setAuditLogs(db.getAuditLogs());
                showToast('Retention schedule saved to institutional configuration.');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Save Schedule
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Data Category</th>
                    <th className="p-3.5">Institutional Purpose</th>
                    <th className="p-3.5">Configured Retention Period</th>
                    <th className="p-3.5">Legal / Regulatory Basis</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {retentionRules.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900">{rule.category}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs">{rule.purpose}</td>
                      <td className="p-3.5">
                        {editingRetentionCategory === rule.category ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingRetentionPeriod}
                              onChange={(e) => setEditingRetentionPeriod(e.target.value)}
                              className="px-2.5 py-1 bg-white border border-teal-500 rounded-lg text-xs font-bold text-slate-900 w-48"
                            />
                            <button
                              onClick={() => {
                                const updated = retentionRules.map((r) =>
                                  r.category === rule.category ? { ...r, retentionPeriod: editingRetentionPeriod } : r
                                );
                                setRetentionRules(updated);
                                db.saveRetentionRules(updated);
                                setEditingRetentionCategory(null);
                                showToast(`Retention period for ${rule.category} updated.`);
                              }}
                              className="px-2 py-1 bg-teal-600 text-white rounded-lg font-bold text-[10px]"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 font-bold">
                            {rule.retentionPeriod}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{rule.legalBasis}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingRetentionCategory(rule.category);
                            setEditingRetentionPeriod(rule.retentionPeriod);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS (Requirement 27) */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-indigo-600" />
                <span>Sensitive Administrative Audit Trail (Requirement 27)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Confidential log of sensitive administrative actions: Exam creation, registration approval, result release, alert adjudication, and candidate record inspection. Never exposed to students.
              </p>
            </div>
            <button
              onClick={() => {
                const csv = 'data:text/csv;charset=utf-8,ID,Admin,Action,Target Record,Date/Time,IP/Session,Status,Details\n' +
                  auditLogs.map(l => `"${l.id}","${l.adminName}","${l.action}","${l.targetRecord}","${l.timestamp}","${l.ipSession}","${l.actionResult}","${(l.details || '').replace(/"/g, '""')}"`).join('\n');
                const encoded = encodeURI(csv);
                const a = document.createElement('a');
                a.href = encoded;
                a.download = `admin_audit_trail_${Date.now()}.csv`;
                a.click();
                showToast('Audit trail exported as CSV.');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">Admin Personnel</th>
                    <th className="p-3.5">Sensitive Action</th>
                    <th className="p-3.5">Target Record</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Network Session</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900">{log.id}</td>
                      <td className="p-3.5 font-sans font-semibold text-slate-800">{log.adminName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans text-slate-700 max-w-xs truncate">{log.targetRecord}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{log.timestamp}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{log.ipSession}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.actionResult}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans text-slate-600 text-[11px] max-w-xs">{log.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PRIVACY OFFICER & POLICY VERSIONING (Requirements 28 & 30) */}
      {activeTab === 'OFFICER' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span>Institutional Privacy Officer & Policy Versioning Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Do not invent fake officer details. The administrator configures official titles, institutional email, phone, and grievance desk links for Government Polytechnic Pune.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Contact Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Designated Examination Privacy Officer & Grievance Contact</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Designation Title</label>
                  <input
                    type="text"
                    value={privacyOfficer.officerTitle}
                    onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, officerTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Office</label>
                  <input
                    type="text"
                    value={privacyOfficer.officeDepartment}
                    onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, officeDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                    <input
                      type="email"
                      value={privacyOfficer.email}
                      onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office Telephone / Ext.</label>
                    <input
                      type="text"
                      value={privacyOfficer.phone}
                      onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Physical Room & Campus Location</label>
                  <input
                    type="text"
                    value={privacyOfficer.roomAddress}
                    onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, roomAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Grievance Desk URL</label>
                  <input
                    type="url"
                    value={privacyOfficer.grievancePortalUrl}
                    onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, grievancePortalUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      db.savePrivacyOfficer(privacyOfficer);
                      showToast('Privacy officer institutional configuration updated.');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    Save Contact Information
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Policy Versioning (Requirement 30) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Policy Versioning Management (Requirement 30)</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Privacy Policy Version</label>
                  <input
                    type="text"
                    value={policyMetadata.privacyPolicyVersion}
                    onChange={(e) => setPolicyMetadata({ ...policyMetadata, privacyPolicyVersion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="text"
                    value={policyMetadata.effectiveDate}
                    onChange={(e) => setPolicyMetadata({ ...policyMetadata, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consent Screen Text Version</label>
                  <input
                    type="text"
                    value={policyMetadata.consentTextVersion}
                    onChange={(e) => setPolicyMetadata({ ...policyMetadata, consentTextVersion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monitoring Policy Version</label>
                  <input
                    type="text"
                    value={policyMetadata.monitoringPolicyVersion}
                    onChange={(e) => setPolicyMetadata({ ...policyMetadata, monitoringPolicyVersion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  When a student agrees on the consent screen, their consent record attaches these exact version tags alongside their Student ID and Timestamp without unnecessary personal data.
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      db.savePolicyMetadata(policyMetadata);
                      showToast('Policy version tags updated for future exam sessions.');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    Publish Policy Version Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE NEW EXAM MODAL */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Create & Schedule Autonomous Exam</span>
              </h3>
              <button
                onClick={() => setShowNewExamModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paper Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. IT-403"
                    value={newExamCode}
                    onChange={(e) => setNewExamCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newExamDept}
                    onChange={(e) => setNewExamDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Computing & Distributed Systems"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={newExamTotalMarks}
                    onChange={(e) => setNewExamTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={newExamPassingMarks}
                    onChange={(e) => setNewExamPassingMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Date</label>
                  <input
                    type="text"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newExamTimeSlot}
                    onChange={(e) => setNewExamTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow cursor-pointer"
                >
                  Schedule & Publish Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALERT REVIEW & REMARK MODAL */}
      {selectedAlertForRemark && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Forensic Incident Review</span>
              </h3>
              <button
                onClick={() => setSelectedAlertForRemark(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div><strong>Candidate:</strong> {selectedAlertForRemark.studentName} ({selectedAlertForRemark.studentRoll})</div>
              <div><strong>Event:</strong> {selectedAlertForRemark.alertType}</div>
              <div><strong>Severity:</strong> {selectedAlertForRemark.severity} ({selectedAlertForRemark.occurrenceCount} occurrences)</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Decision / Status:</label>
                <select
                  value={remarkStatus}
                  onChange={(e) => setRemarkStatus(e.target.value as AlertReviewStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="INVESTIGATED">INVESTIGATED (Exam Resumed)</option>
                  <option value="CLEARED">CLEARED (No Infraction)</option>
                  <option value="PENALIZED">PENALIZED (Official Strike Added)</option>
                  <option value="PENDING_REVIEW">PENDING FURTHER REVIEW</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Administrator Remark:</label>
                <textarea
                  rows={3}
                  value={remarkInput}
                  onChange={(e) => setRemarkInput(e.target.value)}
                  placeholder="Record justification and decision..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAlertForRemark(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAlertRemark}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
