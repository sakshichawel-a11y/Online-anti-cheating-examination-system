import React, { useState } from 'react';
import { 
  StudentProfile, 
  ExamData, 
  ExamAttempt, 
  ExamRegistration, 
  RegistrationStatus 
} from '../types';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Trophy, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Award,
  AlertCircle,
  HelpCircle,
  Calendar,
  Lock,
  Camera,
  GraduationCap,
  Building2,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Edit3,
  FileCheck,
  XCircle,
  Mic,
  Hourglass,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExamRegistrationModal } from './ExamRegistrationModal';

interface DashboardViewProps {
  student: StudentProfile;
  exams: ExamData[];
  attempts: ExamAttempt[];
  registrations: ExamRegistration[];
  onSelectExam: (exam: ExamData) => void;
  onRegisterExam: (exam: ExamData) => void;
  onReviewAttempt: (attempt: ExamAttempt) => void;
  onOpenGuidePart10: () => void;
  onEditProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  exams,
  attempts,
  registrations,
  onSelectExam,
  onRegisterExam,
  onReviewAttempt,
  onOpenGuidePart10,
  onEditProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'MY_EXAMS' | 'RESULTS'>('AVAILABLE');
  const [selectedExamForModal, setSelectedExamForModal] = useState<ExamData | null>(null);

  // Compute student stats
  const completedAttempts = attempts.filter((a) => a.status === 'SUBMITTED');
  const totalCompleted = completedAttempts.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          completedAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalCompleted
        )
      : 0;

  // Helper to get registration status for an exam
  const getExamRegistration = (examId: number) => {
    return registrations.find(
      (r) => r.studentId === student.id && r.examId === examId
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* College Autonomous Header & Student Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Top College Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Autonomous Board of Examinations &bull; Government Polytechnic Pune
              </span>
              <h2 className="text-sm font-bold text-white">
                Online Anti-Cheating Examination Registration System &bull; Academic Session 2026
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <a
              href="https://www.gppune.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 hover:bg-blue-700 text-blue-200 hover:text-white font-semibold border border-blue-600/40 transition"
            >
              <span>Official GPP Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera & Mic Proctoring</span>
            </span>
          </div>
        </div>

        {/* Student Identity Card Body */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-b from-blue-50/40 to-white">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Photo */}
            <div className="relative">
              <img
                src={
                  student.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow">
                VERIFIED
              </span>
            </div>

            {/* Student Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                  {student.rollNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                  PRN: {student.prn || 'PRN2024098124'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong>Course:</strong> {student.course || 'Diploma in Information Technology'}</span>
                <span>&bull;</span>
                <span><strong>Branch:</strong> {student.department || 'Information Technology'}</span>
                <span>&bull;</span>
                <span><strong>Semester:</strong> {student.semester || 'Semester IV'}</span>
              </p>

              <p className="text-xs text-slate-500">
                <strong>Institution:</strong> {student.college || 'Apex Autonomous Institute of Engineering & Technology'} &bull; <strong>Email:</strong> {student.email}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-900 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition flex items-center gap-2 cursor-pointer"
                title="Update your student profile picture, email, or personal details"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Profile & Photo</span>
              </button>
            )}

            <button
              onClick={onOpenGuidePart10}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              title="Inspect Part 10 Flask backend and architecture"
            >
              <FileText className="w-4 h-4" />
              <span>Project Roadmap</span>
            </button>
          </div>

        </div>

      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Available Exams */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Exams
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {exams.length} Papers
            </div>
          </div>
        </div>

        {/* Registered Exams */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Papers
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {registrations.filter((r) => r.studentId === student.id).length} Registered
            </div>
          </div>
        </div>

        {/* Completed Tests */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Papers
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalCompleted} Submitted
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Academic Average
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {avgScore}%
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'AVAILABLE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Available Examination Papers ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_EXAMS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'MY_EXAMS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Registered Exams ({registrations.filter((r) => r.studentId === student.id).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'RESULTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Completed Submissions & Results ({completedAttempts.length})</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE EXAMS */}
      {activeTab === 'AVAILABLE' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Registration & Schedule Guidelines:</strong> Click <strong>"Register for Exam"</strong> to enrol in an examination session. Once your registration is approved by the academic cell, the <strong>"Start Exam"</strong> pre-check will become active during the scheduled time slot.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const reg = getExamRegistration(exam.id);
              const isApproved = reg && reg.status === 'APPROVED';
              const isPending = reg && reg.status === 'PENDING';
              const isRejected = reg && reg.status === 'REJECTED';

              // Check if completed
              const completed = attempts.find(
                (a) => a.examId === exam.id && a.status === 'SUBMITTED'
              );

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                        {exam.code}
                      </span>

                      {/* Registration Status Pill */}
                      {completed ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          COMPLETED
                        </span>
                      ) : isApproved ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ENROLLED (APPROVED)
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-amber-600" />
                          REGISTRATION PENDING
                        </span>
                      ) : isRejected ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          REGISTRATION REJECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          NOT REGISTERED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{exam.subject}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Exam Date</span>
                        <strong className="text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {exam.examDate}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Time Slot</span>
                        <strong className="text-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {exam.timeSlot}
                        </strong>
                      </div>
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                        <strong className="text-slate-800">{exam.durationMinutes} Minutes</strong>
                      </div>
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Marks</span>
                        <strong className="text-slate-800">{exam.totalMarks} Marks (Pass: {exam.passingMarks})</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {completed ? (
                      <button
                        onClick={() => onReviewAttempt(completed)}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>View Submission Scorecard</span>
                      </button>
                    ) : isApproved ? (
                      <button
                        onClick={() => onSelectExam(exam)}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start System Check & Exam &rarr;</span>
                      </button>
                    ) : isPending ? (
                      <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5">
                        <Hourglass className="w-3.5 h-3.5 animate-spin" />
                        <span>Approval in Progress by Exam Cell</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedExamForModal(exam)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Register for Exam</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY REGISTERED EXAMS */}
      {activeTab === 'MY_EXAMS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Enrolled Exam Registrations
                </h3>
                <p className="text-xs text-slate-500">
                  Active registration records for candidate {student.name} ({student.rollNumber}).
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {registrations.filter((r) => r.studentId === student.id).length} Enrolments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Registration ID</th>
                    <th className="p-3.5">Exam Code & Title</th>
                    <th className="p-3.5">Enrolment Date</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Exam Cell Remark</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations
                    .filter((r) => r.studentId === student.id)
                    .map((reg) => {
                      const matchedExam = exams.find((e) => e.id === reg.examId) || exams[0];

                      return (
                        <tr key={reg.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-mono font-bold text-slate-600">
                            #{reg.id}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{reg.examTitle}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{reg.examCode}</div>
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
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {reg.adminRemark || 'No remarks recorded.'}
                          </td>
                          <td className="p-3.5 text-right">
                            {reg.status === 'APPROVED' ? (
                              <button
                                onClick={() => onSelectExam(matchedExam)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                              >
                                Take Exam
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Awaiting Approval</span>
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

      {/* TAB 3: COMPLETED SUBMISSIONS & RESULTS */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Completed Examination Answer Sheets
                </h3>
                <p className="text-xs text-slate-500">
                  Official submission records evaluated by autonomous server-side engine.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {completedAttempts.length} Papers Finished
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Attempt ID</th>
                    <th className="p-3.5">Subject & Paper</th>
                    <th className="p-3.5 text-center">Score / Total</th>
                    <th className="p-3.5 text-center">Percentage</th>
                    <th className="p-3.5 text-center">Result Status</th>
                    <th className="p-3.5 text-center">Proctor Strikes</th>
                    <th className="p-3.5">Submission Time</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedAttempts.map((att) => {
                    const matchedExam = exams.find((e) => e.id === att.examId);
                    const isResultReleased = matchedExam?.isResultPublished !== false;
                    const isPass = att.totalScore >= att.passingMarks;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-500">
                          #{att.id.toString().slice(-6)}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{att.examTitle}</div>
                          <div className="text-[11px] text-slate-500">{att.subject}</div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-sm">
                          {isResultReleased ? (
                            <span>{att.totalScore} / {att.totalMarks}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">Pending Release</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {isResultReleased ? (
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {att.percentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Sealed</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {isResultReleased ? (
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
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              UNDER EVALUATION
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              att.warningCount === 0
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.warningCount} strikes
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          {att.startTime}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onReviewAttempt(att)}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            View Result &rarr;
                          </button>
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

      {/* Registration Modal Dialog */}
      {selectedExamForModal && (
        <ExamRegistrationModal
          exam={selectedExamForModal}
          student={student}
          currentStatus={getExamRegistration(selectedExamForModal.id)?.status}
          onRegister={(exam) => {
            onRegisterExam(exam);
            setSelectedExamForModal(null);
          }}
          onClose={() => setSelectedExamForModal(null)}
        />
      )}

    </div>
  );
};
