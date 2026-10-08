import React, { useState } from 'react';
import { ExamData, StudentProfile, RegistrationStatus } from '../types';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileCheck, 
  Camera, 
  Mic, 
  ArrowRight,
  School,
  FileText,
  Lock,
  Building2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { PolicyPagesModal } from './PolicyPagesModal';
import { PolicyTab } from '../types/privacy';

interface ExamRegistrationModalProps {
  exam: ExamData;
  student: StudentProfile;
  currentStatus?: RegistrationStatus | null;
  onRegister: (exam: ExamData) => void;
  onClose: () => void;
}

export const ExamRegistrationModal: React.FC<ExamRegistrationModalProps> = ({
  exam,
  student,
  currentStatus,
  onRegister,
  onClose,
}) => {
  const [agreeRules, setAgreeRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);

  // Policy Modal state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('privacy');

  const isAlreadyRegistered = currentStatus && currentStatus !== 'REJECTED';

  const handleConfirmRegistration = () => {
    if (!agreeRules) return;
    setIsSubmitting(true);

    setTimeout(() => {
      onRegister(exam);
      setIsSubmitting(false);
      setSuccessStatus(true);
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-scale-up">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Government Polytechnic Pune &bull; Autonomous Examination</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {exam.title}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
              Subject: {exam.subject} &bull; Paper Code: <strong className="text-amber-300">{exam.code}</strong>
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Success Banner */}
            {successStatus ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Registration Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  Your examination enrolment for <strong>{exam.code}</strong> has been logged in the institutional database. Status: <strong>APPROVED</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Existing Registration Alert */}
                {isAlreadyRegistered && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Already Enrolled:</strong> You are already registered for this examination. Current Status:{' '}
                      <span className="font-extrabold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 uppercase">
                        {currentStatus}
                      </span>
                    </div>
                  </div>
                )}

                {/* 1. Exam Information Grid */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>1. Examination Particulars</span>
                    <span className="font-mono text-blue-600 font-bold">{exam.code}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[11px]">Exam Date</span>
                      <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {exam.examDate}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[11px]">Time Slot</span>
                      <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {exam.timeSlot}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[11px]">Duration</span>
                      <strong className="text-slate-900 mt-0.5 block">
                        {exam.durationMinutes} Minutes
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[11px]">Total Marks</span>
                      <strong className="text-slate-900 mt-0.5 block">
                        {exam.totalMarks} Marks (Pass: {exam.passingMarks})
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    <strong>Description & Syllabus:</strong> {exam.description}
                  </div>
                </div>

                {/* 2. Candidate Enrolment Verification */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Candidate Verification Data
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><strong>Student Name:</strong> {student.name}</div>
                    <div><strong>Roll Number:</strong> {student.rollNumber}</div>
                    <div><strong>PRN:</strong> {student.prn || 'PRN2024098124'}</div>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Department: {student.department || 'Information Technology'} &bull; {student.semester || 'Semester IV'}
                  </div>
                </div>

                {/* Requirement 19: Privacy Notice During Registration */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3 text-xs text-slate-800">
                  <div className="font-bold flex items-center justify-between text-blue-950">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      3. Privacy Notice — Information Collected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPolicyModalTab('privacy');
                        setPolicyModalOpen(true);
                      }}
                      className="text-blue-700 hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      View Full Policy
                    </button>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    The examination platform distinguishes clearly between your academic administrative data and temporary monitoring events:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                      <strong className="text-blue-900 block mb-1">A. Required Academic Information:</strong>
                      <span className="text-slate-600">
                        Student name, ID/Roll number, email, mobile, course, branch, semester, registration status, examination answers, and evaluated results.
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                      <strong className="text-amber-900 block mb-1">B. Monitoring Data (During Exam Only):</strong>
                      <span className="text-slate-600">
                        Camera-related events, microphone noise events, browser tab activity, anti-cheating alerts, and date/time of activity. Raw video/audio is not continuously recorded.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Confirmation Agreement */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/60 cursor-pointer text-xs text-blue-950">
                    <input
                      type="checkbox"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold leading-relaxed">
                      I have read the Privacy Notice above. I confirm my registration for this examination and understand that online sessions use camera, microphone, and browser integrity monitoring under institutional data protection guidelines.
                    </span>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {!isAlreadyRegistered ? (
                    <button
                      type="button"
                      disabled={!agreeRules || isSubmitting}
                      onClick={handleConfirmRegistration}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Saving Registration...</span>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>Confirm Exam Registration</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Close (Already Registered)
                    </button>
                  )}
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Policy Modal */}
      <PolicyPagesModal
        isOpen={policyModalOpen}
        initialTab={policyModalTab}
        onClose={() => setPolicyModalOpen(false)}
      />
    </>
  );
};
