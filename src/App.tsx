/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ViewMode, 
  PortalPage, 
  UserRole,
  StudentProfile, 
  TeacherProfile,
  InvigilatorProfile,
  AdminProfile,
  CandidateLiveStatus,
  ProctorAlert,
  ExamData, 
  ExamAttempt, 
  CheatingLogEvent,
  QuestionData,
  ExamRegistration,
  AntiCheatingAlert,
  AlertReviewStatus,
  RegistrationStatus
} from './types';
import { 
  DEMO_STUDENT, 
  DEMO_TEACHER,
  DEMO_INVIGILATOR, 
  DEMO_ADMIN, 
  INITIAL_LIVE_CANDIDATES
} from './data/mockData';
import { db } from './data/db';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { DashboardView } from './components/DashboardView';
import { SystemCheckView } from './components/SystemCheckView';
import { InstructionsView } from './components/InstructionsView';
import { ExamEngineView } from './components/ExamEngineView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { TeacherView } from './components/TeacherView';
import { InvigilatorView } from './components/InvigilatorView';
import { AdminView } from './components/AdminView';
import { UserProfileEdit } from './components/UserProfileEdit';
import { MicroprojectGuideView } from './components/MicroprojectGuideView';
import { PolicyPagesModal } from './components/PolicyPagesModal';
import { PolicyTab } from './types/privacy';
import { ExternalLink, Building2, ShieldCheck, Scale, Database, FileText, Lock } from 'lucide-react';

export default function App() {
  // Global View Mode ('portal' for institutional test engine & proctoring, 'guide' for technical roadmap & code)
  const [viewMode, setViewMode] = useState<ViewMode>('portal');

  // Policy Modal State (Requirements 18 & 32)
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('privacy');

  // Active Role and Profiles
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [loginRole, setLoginRole] = useState<UserRole>('student');
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher'>('student');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [invigilator, setInvigilator] = useState<InvigilatorProfile | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  // Portal Active Page (Default entry is the password-gated Login Page)
  const [portalPage, setPortalPage] = useState<PortalPage>('login');

  // Relational Database State
  const [exams, setExams] = useState<ExamData[]>(() => db.getExams());
  const [selectedExam, setSelectedExam] = useState<ExamData>(() => db.getExams()[0]);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>(() => db.getRegistrations());
  const [alerts, setAlerts] = useState<AntiCheatingAlert[]>(() => db.getAlerts());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => db.getAttempts());
  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>(() => db.getStudents());
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);

  // Live Surveillance State for Invigilator room
  const [liveCandidates, setLiveCandidates] = useState<CandidateLiveStatus[]>(INITIAL_LIVE_CANDIDATES);

  // Technical guide initial part
  const [guidePartId, setGuidePartId] = useState<number>(0);

  // Synchronize state when storage updates
  useEffect(() => {
    setExams(db.getExams());
    setRegistrations(db.getRegistrations());
    setAlerts(db.getAlerts());
    setAttempts(db.getAttempts());
    setRegisteredStudents(db.getStudents());
  }, []);

  // 1. Handle Student Login
  const handleStudentLogin = (profile: StudentProfile) => {
    setStudent(profile);
    setUserRole('student');
    setPortalPage('dashboard');
  };

  // 1b. Handle Student Profile Update
  const handleUpdateStudentProfile = (updatedStudent: StudentProfile) => {
    setStudent(updatedStudent);
    db.updateStudent(updatedStudent);
    setRegisteredStudents(db.getStudents());
  };

  // 2. Handle Teacher Login
  const handleTeacherLogin = (profile: TeacherProfile) => {
    setTeacher(profile);
    setUserRole('teacher');
    setPortalPage('teacher');
  };

  // 3. Handle Invigilator Login
  const handleInvigilatorLogin = (profile: InvigilatorProfile) => {
    setInvigilator(profile);
    setUserRole('invigilator');
    setPortalPage('invigilator');
  };

  // 4. Handle Admin Login
  const handleAdminLogin = (profile: AdminProfile) => {
    setAdmin(profile);
    setUserRole('admin');
    setPortalPage('admin');
  };

  // 5. Switch Active Role / Open Login for Role (Requires Password)
  const handleRoleSelect = (role: UserRole) => {
    setLoginRole(role);
    setViewMode('portal');
    setPortalPage('login');
  };

  // 6. Handle Logout (Clears all active credentials and resets to Login)
  const handleLogout = () => {
    setStudent(null);
    setTeacher(null);
    setInvigilator(null);
    setAdmin(null);
    setUserRole('student');
    setLoginRole('student');
    setPortalPage('login');
  };

  // 7. Exam Registration Action
  const handleRegisterExam = (exam: ExamData) => {
    if (!student) return;
    db.registerStudentForExam(student, exam);
    setRegistrations(db.getRegistrations());
  };

  // 8. Select Exam -> Pre-Flight System Check
  const handleSelectExam = (exam: ExamData) => {
    setSelectedExam(exam);
    setPortalPage('system-check');
  };

  // 9. Launch Exam after System Check passed
  const handleProceedToExam = () => {
    setPortalPage('exam');
  };

  // 10. Record Real-time Forensic Cheating Alert
  const handleRecordAlert = (alert: AntiCheatingAlert) => {
    db.addAlert(alert);
    setAlerts(db.getAlerts());
  };

  // 11. Final Exam Submission Evaluation
  const handleSubmitExam = (
    answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>,
    cheatingLogs: CheatingLogEvent[],
    warningCount: number,
    timeTakenSeconds: number
  ) => {
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const questions = selectedExam.questions;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected && selected === q.correctOption) {
        totalScore += q.marks;
        correctCount += 1;
      } else if (selected) {
        incorrectCount += 1;
      } else {
        unansweredCount += 1;
      }
    });

    const percentage = Math.round((totalScore / selectedExam.totalMarks) * 100);
    const nowStr = new Date().toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newAttempt: ExamAttempt = {
      id: Date.now(),
      studentId: student?.id || 1,
      examId: selectedExam.id,
      examCode: selectedExam.code,
      examTitle: selectedExam.title,
      subject: selectedExam.subject,
      totalMarks: selectedExam.totalMarks,
      passingMarks: selectedExam.passingMarks,
      startTime: nowStr,
      endTime: nowStr,
      totalScore,
      percentage,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      status: warningCount >= 3 ? 'DISQUALIFIED' : 'SUBMITTED',
      warningCount,
      answers,
      cheatingLogs,
    };

    db.addAttempt(newAttempt);
    setAttempts(db.getAttempts());
    setCurrentAttempt(newAttempt);

    setPortalPage('result');
  };

  // 12. Review a specific attempt
  const handleReviewAttempt = (attempt: ExamAttempt) => {
    const matchedExam = exams.find((e) => e.id === attempt.examId) || exams[0];
    setSelectedExam(matchedExam);
    setCurrentAttempt(attempt);
    setPortalPage('result');
  };

  // 13. Admin Actions: Update Registration Status
  const handleUpdateRegistrationStatus = (
    regId: number,
    status: RegistrationStatus,
    remark?: string
  ) => {
    db.updateRegistrationStatus(regId, status, remark);
    setRegistrations(db.getRegistrations());
  };

  // 14. Admin Actions: Update Alert Review Status & Remark
  const handleUpdateAlertStatus = (
    alertId: string,
    status: AlertReviewStatus,
    remark?: string
  ) => {
    db.updateAlertStatus(alertId, status, remark);
    setAlerts(db.getAlerts());
  };

  // 15. Admin Actions: Toggle Publish Results
  const handleTogglePublishResult = (examId: number) => {
    db.togglePublishResult(examId);
    setExams(db.getExams());
  };

  // 16. Admin Actions: Add Exam
  const handleAddExam = (newExam: ExamData) => {
    db.addExam(newExam);
    setExams(db.getExams());
  };

  // 17. Admin Actions: Delete Exam
  const handleDeleteExam = (examId: number) => {
    db.deleteExam(examId);
    setExams(db.getExams());
  };

  // 18. Teacher Actions: Update Question
  const handleUpdateQuestion = (examId: number, updatedQuestion: QuestionData) => {
    setExams((prevExams) =>
      prevExams.map((exam) => {
        if (exam.id === examId) {
          return {
            ...exam,
            questions: exam.questions.map((q) =>
              q.id === updatedQuestion.id ? updatedQuestion : q
            ),
          };
        }
        return exam;
      })
    );
  };

  // 19. Teacher Actions: Add Question
  const handleAddQuestion = (examId: number, newQuestion: QuestionData) => {
    setExams((prevExams) =>
      prevExams.map((exam) => {
        if (exam.id === examId) {
          const updatedQuestions = [...exam.questions, newQuestion];
          return {
            ...exam,
            totalQuestions: updatedQuestions.length,
            totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0),
            questions: updatedQuestions,
          };
        }
        return exam;
      })
    );
  };

  // 20. Invigilator Actions
  const handleIssueWarning = (candidateId: number, reason: string) => {
    setLiveCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const nextStrikes = Math.min(3, c.strikes + 1);
          return {
            ...c,
            strikes: nextStrikes,
            status: nextStrikes >= 3 ? 'TERMINATED' : 'FLAGGED',
            lastEvent: `Proctor Warning: ${reason}`,
            lastEventTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        }
        return c;
      })
    );
  };

  const handleTerminateCandidate = (candidateId: number, reason: string) => {
    setLiveCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            strikes: 3,
            status: 'TERMINATED',
            cameraLive: false,
            micLive: false,
            lastEvent: `Terminated by Proctor: ${reason}`,
            lastEventTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        }
        return c;
      })
    );
  };

  const handleRequestRoomScan = (candidateId: number) => {
    setLiveCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              lastEvent: '360° Physical Room Scan Prompted',
              lastEventTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            }
          : c
      )
    );
  };

  // 21. Open Guide Part
  const handleOpenGuidePart = (partId: number) => {
    setGuidePartId(partId);
    setViewMode('guide');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Universal Institutional Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        portalPage={portalPage}
        userRole={userRole}
        student={student}
        teacher={teacher}
        invigilator={invigilator}
        admin={admin}
        onSelectRole={handleRoleSelect}
        onLogout={handleLogout}
        onNavigateHistory={() => {
          setViewMode('portal');
          setPortalPage('history');
        }}
        onNavigateDashboard={() => {
          setViewMode('portal');
          setUserRole('student');
          setPortalPage('dashboard');
        }}
        onNavigateProfile={() => {
          if (userRole === 'student') {
            setViewMode('portal');
            setPortalPage('profile');
          }
        }}
        onNavigateTeacher={() => {
          setViewMode('portal');
          if (teacher) {
            setUserRole('teacher');
            setPortalPage('teacher');
          } else {
            setLoginRole('teacher');
            setPortalPage('login');
          }
        }}
        onNavigateInvigilator={() => {
          setViewMode('portal');
          if (invigilator) {
            setUserRole('invigilator');
            setPortalPage('invigilator');
          } else {
            setLoginRole('invigilator');
            setPortalPage('login');
          }
        }}
        onNavigateAdmin={() => {
          setViewMode('portal');
          if (admin) {
            setUserRole('admin');
            setPortalPage('admin');
          } else {
            setLoginRole('admin');
            setPortalPage('login');
          }
        }}
        onNavigateRegister={() => {
          setViewMode('portal');
          setRegisterRole('student');
          setPortalPage('register');
        }}
        onNavigateLogin={() => {
          setViewMode('portal');
          setLoginRole('student');
          setPortalPage('login');
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {viewMode === 'guide' ? (
          /* Technical Architecture & Blueprint */
          <MicroprojectGuideView
            initialPartId={guidePartId}
            onLaunchPortal={() => setViewMode('portal')}
          />
        ) : (
          /* Position-Specific Application Spaces */
          <>
            {portalPage === 'landing' ? (
              <LandingView
                onSelectRole={handleRoleSelect}
                onNavigateLogin={(r) => {
                  if (r) setLoginRole(r);
                  setPortalPage('login');
                }}
                onNavigateRegister={(r) => {
                  if (r) setRegisterRole(r);
                  setPortalPage('register');
                }}
                onOpenGuide={() => handleOpenGuidePart(0)}
              />
            ) : portalPage === 'register' ? (
              <RegisterView
                initialRole={registerRole}
                onRegisterUserSuccess={(user, autoLogin) => {
                  if (autoLogin) {
                    if (user.role === 'student') {
                      const s: StudentProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        rollNumber: user.idCode,
                        prn: user.details?.prn,
                        college: user.college,
                        department: user.department,
                        semester: user.details?.semester,
                        phone: user.details?.phone,
                        avatarUrl: user.avatarUrl,
                        verified: true,
                      };
                      setStudent(s);
                      setUserRole('student');
                      setPortalPage('dashboard');
                    } else if (user.role === 'teacher') {
                      const t: TeacherProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        employeeCode: user.idCode,
                        department: user.department || 'Information Technology',
                        college: user.college || 'Government Polytechnic Pune',
                        designation: user.details?.designation || 'Faculty Professor',
                        assignedSubject: user.details?.assignedSubject || 'Core Engineering',
                        phone: user.details?.phone,
                        avatarUrl: user.avatarUrl,
                      };
                      setTeacher(t);
                      setUserRole('teacher');
                      setPortalPage('teacher');
                    } else if (user.role === 'invigilator') {
                      const inv: InvigilatorProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        employeeCode: user.idCode,
                        department: user.department || 'Information Technology',
                        college: user.college || 'Government Polytechnic Pune',
                        roomAssigned: user.details?.roomAssigned || 'Exam Hall A-102',
                        phone: user.details?.phone,
                        avatarUrl: user.avatarUrl,
                      };
                      setInvigilator(inv);
                      setUserRole('invigilator');
                      setPortalPage('invigilator');
                    } else if (user.role === 'admin') {
                      const adm: AdminProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        adminCode: user.idCode,
                        designation: user.details?.designation || 'Controller of Examinations',
                        college: user.college || 'Government Polytechnic Pune',
                        accessLevel: 'CONTROLLER_OF_EXAMS',
                        avatarUrl: user.avatarUrl,
                      };
                      setAdmin(adm);
                      setUserRole('admin');
                      setPortalPage('admin');
                    }
                  } else {
                    setLoginRole(user.role);
                    setPortalPage('login');
                  }
                }}
                onRegisterSuccess={(newStudent, autoLogin) => {
                  db.addStudent(newStudent);
                  setRegisteredStudents(db.getStudents());
                  if (autoLogin) {
                    setStudent(newStudent);
                    setUserRole('student');
                    setPortalPage('dashboard');
                  } else {
                    setLoginRole('student');
                    setPortalPage('login');
                  }
                }}
                onRegisterTeacherSuccess={(newTeacher, autoLogin) => {
                  db.addTeacher(newTeacher);
                  if (autoLogin) {
                    setTeacher(newTeacher);
                    setUserRole('teacher');
                    setPortalPage('teacher');
                  } else {
                    setLoginRole('teacher');
                    setPortalPage('login');
                  }
                }}
                onNavigateLogin={(role) => {
                  if (role) setLoginRole(role);
                  setPortalPage('login');
                }}
              />
            ) : portalPage === 'login' ? (
              <LoginView
                initialRole={loginRole}
                onLoginSuccess={handleStudentLogin}
                onTeacherLogin={handleTeacherLogin}
                onInvigilatorLogin={handleInvigilatorLogin}
                onAdminLogin={handleAdminLogin}
                onOpenGuide={() => handleOpenGuidePart(9)}
                onNavigateRegister={(role) => {
                  if (role) setRegisterRole(role);
                  setPortalPage('register');
                }}
              />
            ) : userRole === 'teacher' ? (
              /* Dedicated Teacher Application: 6 Professors, 35 Questions, Submissions */
              teacher ? (
                <TeacherView
                  teacher={teacher}
                  exams={exams}
                  attempts={attempts}
                  students={registeredStudents}
                  onSelectTeacher={(t) => setTeacher(t)}
                  onUpdateQuestion={handleUpdateQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              ) : (
                <LoginView
                  initialRole="teacher"
                  onLoginSuccess={handleStudentLogin}
                  onTeacherLogin={handleTeacherLogin}
                  onInvigilatorLogin={handleInvigilatorLogin}
                  onAdminLogin={handleAdminLogin}
                  onOpenGuide={() => handleOpenGuidePart(9)}
                  onNavigateRegister={(role) => {
                    if (role) setRegisterRole(role);
                    setPortalPage('register');
                  }}
                />
              )
            ) : userRole === 'invigilator' ? (
              /* Dedicated Invigilator Application: Live CCTV Surveillance & AI Strikes */
              invigilator ? (
                <InvigilatorView
                  invigilator={invigilator}
                  candidates={liveCandidates}
                  alerts={alerts.map((a) => ({
                    id: a.id,
                    timestamp: a.timestamp,
                    candidateName: a.studentName,
                    rollNumber: a.studentRoll,
                    eventType: a.alertType,
                    description: a.adminRemark || `Automated proctor flag: ${a.alertType}`,
                    severity: a.severity === 'High' ? 'high' : a.severity === 'Medium' ? 'medium' : 'low',
                  }))}
                  onIssueWarning={handleIssueWarning}
                  onTerminateCandidate={handleTerminateCandidate}
                  onRequestRoomScan={handleRequestRoomScan}
                />
              ) : (
                <LoginView
                  initialRole="invigilator"
                  onLoginSuccess={handleStudentLogin}
                  onTeacherLogin={handleTeacherLogin}
                  onInvigilatorLogin={handleInvigilatorLogin}
                  onAdminLogin={handleAdminLogin}
                  onOpenGuide={() => handleOpenGuidePart(9)}
                  onNavigateRegister={(role) => {
                    if (role) setRegisterRole(role);
                    setPortalPage('register');
                  }}
                />
              )
            ) : userRole === 'admin' ? (
              /* Dedicated Admin Application: CoE Dashboard, Registrations, Alerts, Results */
              admin ? (
                portalPage === 'history' ? (
                  <HistoryView
                    attempts={attempts}
                    student={student}
                    onReviewAttempt={handleReviewAttempt}
                    onBackToDashboard={() => setPortalPage('admin')}
                  />
                ) : (
                  <AdminView
                    admin={admin}
                    exams={exams}
                    alerts={alerts}
                    students={registeredStudents}
                    registrations={registrations}
                    attempts={attempts}
                    onReviewAttempt={handleReviewAttempt}
                    onAddExam={handleAddExam}
                    onDeleteExam={handleDeleteExam}
                    onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                    onUpdateAlertStatus={handleUpdateAlertStatus}
                    onTogglePublishResult={handleTogglePublishResult}
                  />
                )
              ) : (
                <LoginView
                  initialRole="admin"
                  onLoginSuccess={handleStudentLogin}
                  onTeacherLogin={handleTeacherLogin}
                  onInvigilatorLogin={handleInvigilatorLogin}
                  onAdminLogin={handleAdminLogin}
                  onOpenGuide={() => handleOpenGuidePart(9)}
                  onNavigateRegister={(role) => {
                    if (role) setRegisterRole(role);
                    setPortalPage('register');
                  }}
                />
              )
            ) : (
              /* Dedicated Student Application (Guarded) */
              student ? (
                <>
                  {portalPage === 'profile' ? (
                    <UserProfileEdit
                      student={student}
                      userRole={userRole}
                      onSaveProfile={handleUpdateStudentProfile}
                      onCancel={() => setPortalPage('dashboard')}
                    />
                  ) : portalPage === 'dashboard' ? (
                    <DashboardView
                      student={student}
                      exams={exams}
                      attempts={attempts}
                      registrations={registrations}
                      onSelectExam={handleSelectExam}
                      onRegisterExam={handleRegisterExam}
                      onReviewAttempt={handleReviewAttempt}
                      onOpenGuidePart10={() => handleOpenGuidePart(10)}
                      onEditProfile={() => setPortalPage('profile')}
                    />
                  ) : portalPage === 'system-check' ? (
                    <SystemCheckView
                      exam={selectedExam}
                      student={student}
                      onProceedToExam={handleProceedToExam}
                      onBack={() => setPortalPage('dashboard')}
                    />
                  ) : portalPage === 'instructions' ? (
                    <InstructionsView
                      exam={selectedExam}
                      student={student}
                      onBack={() => setPortalPage('dashboard')}
                      onStartExam={handleProceedToExam}
                    />
                  ) : portalPage === 'exam' ? (
                    <ExamEngineView
                      exam={selectedExam}
                      student={student}
                      onSubmitExam={handleSubmitExam}
                      onRecordAlert={handleRecordAlert}
                    />
                  ) : portalPage === 'result' && currentAttempt ? (
                    <ResultView
                      attempt={currentAttempt}
                      exam={selectedExam}
                      onReturnDashboard={() => setPortalPage('dashboard')}
                      onViewHistory={() => setPortalPage('history')}
                    />
                  ) : portalPage === 'history' ? (
                    <HistoryView
                      attempts={attempts.filter(
                        (a) => a.studentRoll === student.rollNumber
                      )}
                      student={student}
                      onReviewAttempt={handleReviewAttempt}
                      onBackToDashboard={() => setPortalPage('dashboard')}
                    />
                  ) : (
                    <DashboardView
                      student={student}
                      exams={exams}
                      attempts={attempts}
                      registrations={registrations}
                      onSelectExam={handleSelectExam}
                      onRegisterExam={handleRegisterExam}
                      onReviewAttempt={handleReviewAttempt}
                      onOpenGuidePart10={() => handleOpenGuidePart(10)}
                      onEditProfile={() => setPortalPage('profile')}
                    />
                  )}
                </>
              ) : (
                <LoginView
                  initialRole="student"
                  onLoginSuccess={handleStudentLogin}
                  onTeacherLogin={handleTeacherLogin}
                  onInvigilatorLogin={handleInvigilatorLogin}
                  onAdminLogin={handleAdminLogin}
                  onOpenGuide={() => handleOpenGuidePart(9)}
                  onNavigateRegister={() => setPortalPage('register')}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Persistent Academic Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Online Anti-Cheating Examination Registration System &bull; Apex Autonomous Institute of Engineering
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenGuidePart(5)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Relational Schema (8 Tables)
            </button>
            <button
              onClick={() => handleOpenGuidePart(2)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              DFD & ER Diagrams
            </button>
            <button
              onClick={() => handleOpenGuidePart(0)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              System Workflow
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
