import React from 'react';
import { ExamAttempt, ExamData } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ArrowLeft, 
  BookOpen, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface ResultViewProps {
  attempt: ExamAttempt;
  exam: ExamData;
  onReturnDashboard: () => void;
  onViewHistory: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  attempt,
  exam,
  onReturnDashboard,
  onViewHistory,
}) => {
  const isPass = attempt.totalScore >= attempt.passingMarks;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Result Overview Header Card (Part 18) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Banner with Pass/Fail color */}
        <div
          className={`p-6 sm:p-8 text-white ${
            isPass
              ? 'bg-gradient-to-r from-emerald-700 to-teal-800'
              : 'bg-gradient-to-r from-red-700 to-rose-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Examination Result</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {attempt.examTitle}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                Completed on {attempt.endTime || attempt.startTime}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-block px-4 py-1.5 rounded-full font-black text-sm sm:text-base tracking-wider uppercase shadow-sm ${
                  isPass
                    ? 'bg-white text-emerald-800'
                    : 'bg-white text-red-800'
                }`}
              >
                {isPass ? 'STATUS: PASSED' : 'STATUS: FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* Score Metrics Grid */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-medium uppercase">Score Obtained</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {attempt.totalScore} <span className="text-sm font-normal text-slate-400">/ {attempt.totalMarks}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-medium uppercase">Percentage</div>
              <div
                className={`text-2xl font-black mt-1 ${
                  isPass ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {attempt.percentage}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-medium uppercase">Passing Threshold</div>
              <div className="text-2xl font-black text-slate-700 mt-1">
                {attempt.passingMarks} <span className="text-xs font-normal text-slate-400">(50%)</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-xs text-slate-500 font-medium uppercase">Cheating Warnings</div>
              <div
                className={`text-2xl font-black mt-1 ${
                  attempt.warningCount === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {attempt.warningCount} <span className="text-xs font-normal text-slate-400">/ 3</span>
              </div>
            </div>

          </div>
        </div>

        {/* Actions Bar */}
        <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-white">
          <button
            onClick={onReturnDashboard}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={onViewHistory}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>View All History</span>
          </button>
        </div>

      </div>

      {/* Anti-Cheating Forensic Audit Trail */}
      {attempt.cheatingLogs && attempt.cheatingLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-amber-100 bg-amber-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm">Anti-Cheating Forensic Audit Trail</h3>
            </div>
            <span className="text-xs font-semibold bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full">
              {attempt.cheatingLogs.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {attempt.cheatingLogs.map((log, index) => (
              <div key={log.id || index} className="p-3 text-xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold text-[10px]">
                    {log.eventType}
                  </span>
                  <div>
                    <div className="font-medium text-slate-800">{log.description}</div>
                    <div className="text-slate-400 text-[11px]">Warning Trigger: #{log.warningNumber}</div>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Evaluation Breakdown (Part 18) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Detailed Question Review</span>
          </h2>
          <span className="text-xs text-slate-500">
            {exam.questions.length} Evaluated Questions
          </span>
        </div>

        <div className="space-y-4">
          {exam.questions.map((q, idx) => {
            const studentChoice = attempt.answers[q.id];
            const isCorrect = studentChoice === q.correctOption;
            const isSkipped = !studentChoice;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isSkipped
                    ? 'border-slate-200'
                    : 'border-red-200 bg-red-50/10'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {q.questionText}
                    </h3>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> +{q.marks} Mark
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Skipped (0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> 0 Marks
                      </span>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const optText = q[`option${opt}` as keyof typeof q] as string;
                    const isCandidateChoice = studentChoice === opt;
                    const isOfficialCorrect = q.correctOption === opt;

                    let badgeStyle = 'bg-slate-50 text-slate-700 border-slate-200';

                    if (isOfficialCorrect) {
                      badgeStyle = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold ring-1 ring-emerald-400';
                    } else if (isCandidateChoice && !isCorrect) {
                      badgeStyle = 'bg-red-50 text-red-900 border-red-300 font-semibold line-through';
                    }

                    return (
                      <div
                        key={opt}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${badgeStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{opt}.</span>
                          <span>{optText}</span>
                        </div>
                        {isOfficialCorrect && (
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                        {isCandidateChoice && !isOfficialCorrect && (
                          <span className="text-[10px] font-bold uppercase text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
