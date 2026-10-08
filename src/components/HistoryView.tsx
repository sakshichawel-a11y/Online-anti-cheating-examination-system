import React, { useState } from 'react';
import { ExamAttempt, StudentProfile } from '../types';
import { 
  Clock, 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Award, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Printer, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Eye
} from 'lucide-react';

interface HistoryViewProps {
  attempts: ExamAttempt[];
  student?: StudentProfile | null;
  onReviewAttempt: (attempt: ExamAttempt) => void;
  onBackToDashboard: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  attempts,
  student,
  onReviewAttempt,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASS' | 'FAIL' | 'DISQUALIFIED'>('ALL');
  const [selectedAttemptForCert, setSelectedAttemptForCert] = useState<ExamAttempt | null>(null);
  const [selectedAttemptForAudit, setSelectedAttemptForAudit] = useState<ExamAttempt | null>(null);

  // Filter attempts
  const filteredAttempts = attempts.filter((att) => {
    const isPass = att.totalScore >= att.passingMarks;
    const matchesSearch =
      att.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.examCode && att.examCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'PASS') return isPass && att.status !== 'DISQUALIFIED';
    if (filterStatus === 'FAIL') return !isPass && att.status !== 'DISQUALIFIED';
    if (filterStatus === 'DISQUALIFIED') return att.status === 'DISQUALIFIED';
    return true;
  });

  // Calculate high-level aggregates
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.totalScore >= a.passingMarks && a.status !== 'DISQUALIFIED').length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const cleanProctorAttempts = attempts.filter((a) => (a.warningCount || 0) === 0).length;
  const integrityScore = totalAttempts > 0 ? Math.round((cleanProctorAttempts / totalAttempts) * 100) : 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2 border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Academic Audit Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Candidate Examination History & Marksheets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Verified record of completed tests, percentages, digital certificates, and proctoring integrity forensics.
            </p>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tests Logged</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalAttempts} Exams</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Passing Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{passRate}%</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Integrity Score</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-0.5">{integrityScore}% Clean</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student PRN</div>
            <div className="text-sm font-mono font-bold text-slate-800 mt-2 truncate">
              {student?.prn || 'PRN2024098124'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Controls Bar: Search & Status Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, title or paper code..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'PASS', 'FAIL', 'DISQUALIFIED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="p-0">
          {filteredAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-100/80 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Examination Paper</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Completed On</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Result</th>
                    <th className="py-3.5 px-4">Proctoring Integrity</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((att) => {
                    const isPass = att.totalScore >= att.passingMarks;
                    const isDisqualified = att.status === 'DISQUALIFIED';
                    const hasWarnings = (att.warningCount || 0) > 0;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{att.examTitle}</div>
                          <div className="text-[11px] font-mono text-blue-700">{att.examCode || 'IT-PAPER'}</div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 text-xs">
                          {att.subject}
                        </td>

                        <td className="py-4 px-4 text-slate-500 text-xs font-mono">
                          {att.endTime || att.startTime}
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900">{att.totalScore}</span>
                          <span className="text-slate-400">/{att.totalMarks}</span>
                          <span className="ml-1.5 text-xs font-mono text-slate-500">({att.percentage}%)</span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isDisqualified
                                ? 'bg-red-100 text-red-800'
                                : isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isDisqualified ? (
                              <>
                                <AlertOctagon className="w-3 h-3" /> EXPELLED
                              </>
                            ) : isPass ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> PASS
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> FAIL
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {isDisqualified ? (
                            <button
                              onClick={() => setSelectedAttemptForAudit(att)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md border border-red-200 transition cursor-pointer"
                            >
                              <ShieldAlert className="w-3 h-3" /> 3 Strikes (Disqualified)
                            </button>
                          ) : hasWarnings ? (
                            <button
                              onClick={() => setSelectedAttemptForAudit(att)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition cursor-pointer"
                            >
                              <AlertTriangle className="w-3 h-3" /> {att.warningCount} Warning(s)
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> 100% Clean Proctor
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAttemptForCert(att)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200 cursor-pointer inline-flex items-center gap-1"
                            title="Print official Statement of Marks"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Marksheet</span>
                          </button>

                          <button
                            onClick={() => onReviewAttempt(att)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No examination records match your filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No exam history found. Complete a paper from the scheduled exam list to generate an official marksheet and anti-cheating audit trail.
              </p>
              <button
                onClick={onBackToDashboard}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Go to Active Exams
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Official Marksheet & Certificate Modal */}
      {selectedAttemptForCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">Official Autonomous Statement of Marks</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedAttemptForCert(null)}
                  className="text-slate-400 hover:text-slate-600 text-base font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Marksheet Container */}
            <div className="p-6 border-2 border-slate-900 rounded-xl bg-white space-y-6 text-slate-900 font-serif">
              
              {/* College Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">
                  AUTONOMOUS BOARD OF TECHNICAL EXAMINATIONS
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-950 font-serif">
                  APEX AUTONOMOUS INSTITUTE OF ENGINEERING & TECHNOLOGY
                </h2>
                <div className="text-xs text-slate-600 font-sans">
                  Approved by AICTE &bull; Department of Information Technology &bull; Academic Session 2026
                </div>
              </div>

              {/* Student Identity Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Candidate Name:</span>{' '}
                  <b className="text-slate-900">{student?.name || 'Sakshi Chawel'}</b>
                </div>
                <div>
                  <span className="text-slate-500">Permanent Reg. No (PRN):</span>{' '}
                  <b className="font-mono text-slate-900">{student?.prn || 'PRN2024098124'}</b>
                </div>
                <div>
                  <span className="text-slate-500">Class Roll Number:</span>{' '}
                  <b className="font-mono text-slate-900">{student?.rollNumber || 'IT-2026-042'}</b>
                </div>
                <div>
                  <span className="text-slate-500">Semester & Branch:</span>{' '}
                  <b className="text-slate-900">{student?.semester || 'Semester IV'} ({student?.department || 'IT'})</b>
                </div>
              </div>

              {/* Marks Table */}
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 font-bold">Paper Title</th>
                    <th className="border border-slate-300 p-2 font-bold">Code</th>
                    <th className="border border-slate-300 p-2 font-bold">Max Marks</th>
                    <th className="border border-slate-300 p-2 font-bold">Marks Obtained</th>
                    <th className="border border-slate-300 p-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">{selectedAttemptForCert.examTitle}</td>
                    <td className="border border-slate-300 p-2 font-mono">{selectedAttemptForCert.examCode || 'IT-401'}</td>
                    <td className="border border-slate-300 p-2">{selectedAttemptForCert.totalMarks}</td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-950">{selectedAttemptForCert.totalScore}</td>
                    <td className="border border-slate-300 p-2 font-bold">
                      {selectedAttemptForCert.totalScore >= selectedAttemptForCert.passingMarks ? 'PASSED' : 'FAILED'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Anti Cheating Verification Seal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs font-sans">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>AI Surveillance Verified Clean</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Hash: 9b882f0a1c... &bull; Warnings: {selectedAttemptForCert.warningCount || 0}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic font-bold text-slate-800">Dr. Meera Kulkarni</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Controller of Examinations</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Forensic Cheating Incident Audit Modal */}
      {selectedAttemptForAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Anti-Cheating Forensic Audit Timeline</span>
              </h3>
              <button
                onClick={() => setSelectedAttemptForAudit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><span className="font-semibold text-slate-600">Exam:</span> {selectedAttemptForAudit.examTitle}</div>
              <div><span className="font-semibold text-slate-600">Total Warnings:</span> {selectedAttemptForAudit.warningCount} / 3 Strikes</div>
              <div><span className="font-semibold text-slate-600">Status:</span> {selectedAttemptForAudit.status}</div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedAttemptForAudit.cheatingLogs && selectedAttemptForAudit.cheatingLogs.length > 0 ? (
                selectedAttemptForAudit.cheatingLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span className="font-mono">{log.eventType}</span>
                      <span className="font-mono text-[11px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700">{log.description}</p>
                    <div className="text-[10px] text-amber-800 font-bold">Strike #{log.warningNumber} recorded</div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-slate-500 text-xs">
                  No automated sensor violations were recorded during this test session.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAttemptForAudit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
