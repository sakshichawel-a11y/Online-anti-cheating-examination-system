import React, { useState } from 'react';
import { 
  TeacherProfile, 
  ExamData, 
  QuestionData, 
  ExamAttempt, 
  StudentProfile 
} from '../types';
import { TEACHERS_LIST } from '../data/mockData';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Award, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar, 
  Building2, 
  School, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  FileCheck,
  Check,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface TeacherViewProps {
  teacher: TeacherProfile;
  exams: ExamData[];
  attempts: ExamAttempt[];
  students: StudentProfile[];
  onSelectTeacher?: (teacher: TeacherProfile) => void;
  onUpdateQuestion?: (examId: number, question: QuestionData) => void;
  onAddQuestion?: (examId: number, question: QuestionData) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  teacher,
  exams,
  attempts,
  students,
  onSelectTeacher,
  onUpdateQuestion,
  onAddQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'SUBMISSIONS' | 'STUDENTS' | 'ROSTER'>('QUESTIONS');
  const [selectedExamId, setSelectedExamId] = useState<number>(exams[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Question editing/adding state
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrect, setNewCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered questions
  const filteredQuestions = (selectedExam?.questions || []).filter((q) => {
    const qMatches =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionC.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionD.toLowerCase().includes(searchQuery.toLowerCase());
    return qMatches;
  });

  // Handle Edit question save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (onUpdateQuestion) {
      onUpdateQuestion(selectedExam.id, editingQuestion);
    }
    showToast(`Question #${editingQuestion.id} updated successfully.`);
    setEditingQuestion(null);
  };

  // Handle Add question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOptA.trim() || !newOptB.trim()) {
      showToast('Please provide question prompt and at least Options A & B.');
      return;
    }

    const nextId = (selectedExam.questions.length > 0
      ? Math.max(...selectedExam.questions.map((q) => q.id)) + 1
      : 1);

    const created: QuestionData = {
      id: nextId,
      examId: selectedExam.id,
      questionText: newQuestionText.trim(),
      optionA: newOptA.trim(),
      optionB: newOptB.trim(),
      optionC: newOptC.trim() || 'None of the above',
      optionD: newOptD.trim() || 'All of the above',
      correctOption: newCorrect,
      marks: 1,
    };

    if (onAddQuestion) {
      onAddQuestion(selectedExam.id, created);
    }
    showToast(`Question #${nextId} created with single correct answer (${newCorrect}).`);
    setShowAddModal(false);
    setNewQuestionText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewCorrect('A');
  };

  // Export class grades CSV
  const handleExportGradesCSV = () => {
    const header = 'Attempt ID,Roll Number,Exam Code,Exam Title,Score,Total Marks,Percentage,Status,Date\n';
    const rows = attempts.map((a) => 
      `"${a.id}","IT-2026-042","${a.examCode || selectedExam.code}","${a.examTitle}","${a.totalScore}","${a.totalMarks}","${a.percentage}%","${a.status}","${a.startTime}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `class_gradebook_${selectedExam.code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Class performance gradebook exported.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Professor Identity Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                alt={teacher.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full border border-emerald-300">
                FACULTY
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <School className="w-3.5 h-3.5 text-blue-400" />
                <span>Department of {teacher.department} &bull; Apex Autonomous</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {teacher.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {teacher.designation} &bull; <strong className="text-amber-300">{teacher.employeeCode}</strong>
              </p>
              <p className="text-xs text-blue-200/80">
                Assigned Course: <strong>{teacher.assignedSubject}</strong>
              </p>
            </div>
          </div>

          {/* Switch Faculty Profile Picker */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Active Professor (6 Faculty Roster)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <select
              value={teacher.id}
              onChange={(e) => {
                const found = TEACHERS_LIST.find((t) => t.id === Number(e.target.value));
                if (found && onSelectTeacher) {
                  onSelectTeacher(found);
                  showToast(`Switched active faculty view to ${found.name}`);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {TEACHERS_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Departmental Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-blue-900/60 text-slate-200">
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Paper Questions</span>
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {selectedExam.questions.length} Questions
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
              <span>Single-Choice Only</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">100% Enforced</div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
              <span>Student Submissions</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {attempts.length} Submissions
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold flex items-center justify-between">
              <span>Auto-Pass Threshold</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {selectedExam.passingMarks} / {selectedExam.totalMarks} Marks
            </div>
          </div>
        </div>

      </div>

      {/* Faculty Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'QUESTIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question Paper Authoring ({selectedExam.questions.length} Questions)</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'SUBMISSIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Class Submissions & Evaluation ({attempts.length})</span>
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
          <span>Candidate Verification Desk ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'ROSTER'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Invigilation Duty Schedule (6 Professors)</span>
        </button>
      </div>

      {/* TAB 1: QUESTION PAPER & 35 QUESTIONS */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-5">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Selected Paper:</span>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.code} &bull; {exam.title} ({exam.questions.length} Questions)
                  </option>
                ))}
              </select>

              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Single-Choice Answers Only &bull; 1 Mark Each
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Exam Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredQuestions.length} of {selectedExam.questions.length} questions in this paper</span>
              <span className="font-semibold text-slate-700">Total Marks: {selectedExam.totalMarks} (Passing: {selectedExam.passingMarks})</span>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                        {q.id}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {q.questionText}
                        </h3>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Marks: <strong>{q.marks} Mark</strong></span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Single Answer: Option {q.correctOption}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-200 cursor-pointer flex-shrink-0"
                      title="Edit Question & Single Choice Answer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isCorrect = q.correctOption === optKey;
                      const optText = 
                        optKey === 'A' ? q.optionA :
                        optKey === 'B' ? q.optionB :
                        optKey === 'C' ? q.optionC : q.optionD;

                      return (
                        <div
                          key={optKey}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span>{optText}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Correct Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CLASS SUBMISSIONS & EVALUATION */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Evaluation & Gradebook &bull; {selectedExam.title}
              </h2>
              <p className="text-xs text-slate-500">
                Automated computer-vision evaluated exam attempts. Passing grade: {selectedExam.passingMarks} / {selectedExam.totalMarks} Marks ({Math.round((selectedExam.passingMarks/selectedExam.totalMarks)*100)}%).
              </p>
            </div>

            <button
              onClick={handleExportGradesCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Gradebook</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Attempt ID</th>
                    <th className="p-3.5">Candidate Details</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5 text-center">Score / Total</th>
                    <th className="p-3.5 text-center">Percentage</th>
                    <th className="p-3.5 text-center">Proctor Strikes</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Time Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((att) => {
                    const isPass = att.totalScore >= att.passingMarks;
                    const isDisqualified = att.status === 'DISQUALIFIED';

                    return (
                      <tr key={att.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-mono font-semibold text-slate-500">
                          #{att.id.toString().slice(-6)}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">Sakshi Chawel</div>
                          <div className="text-[11px] text-slate-500">IT-2026-042 &bull; PRN2024098124</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{att.examTitle}</div>
                          <div className="text-[11px] text-slate-500">{att.subject}</div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-sm text-slate-900">
                          {att.totalScore} / {att.totalMarks}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                              isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              att.warningCount === 0
                                ? 'bg-slate-100 text-slate-600'
                                : att.warningCount >= 3
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.warningCount} strikes
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {isDisqualified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                              <XCircle className="w-3 h-3" />
                              DISQUALIFIED
                            </span>
                          ) : isPass ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              PASSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {att.startTime}
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

      {/* TAB 3: CANDIDATE VERIFICATION DESK */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Departmental Enrolled Candidates
              </h2>
              <p className="text-xs text-slate-500">
                Candidates registered for Autonomous Examination Session &bull; Department of {teacher.department}
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              Total Enrolled: {students.length} Candidates
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((st) => (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={st.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{st.name}</h3>
                    <div className="text-xs text-blue-600 font-semibold">{st.rollNumber}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{st.prn || 'PRN2024098124'}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div><strong>Email:</strong> {st.email}</div>
                  <div><strong>Semester:</strong> {st.semester || 'Semester IV'}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">ID Verification:</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      PHOTO VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY ROSTER & INVIGILATION DUTY */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Autonomous College Faculty & Invigilation Roster
              </h2>
              <p className="text-xs text-slate-500">
                Official duty allocations for 6 nominated academic professors across Examination Halls A through F.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
              6 Nominated Professors
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEACHERS_LIST.map((prof, index) => {
              const hallLetter = String.fromCharCode(65 + index);
              const isCurrent = prof.id === teacher.id;

              return (
                <div
                  key={prof.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition ${
                    isCurrent
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                      alt={prof.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{prof.name}</h3>
                      </div>
                      <div className="text-xs text-slate-500">{prof.designation}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div><strong>Department:</strong> {prof.department}</div>
                    <div><strong>Employee Code:</strong> {prof.employeeCode}</div>
                    <div><strong>Assigned Course:</strong> {prof.assignedSubject}</div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Virtual Hall-{hallLetter}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          CURRENT VIEW
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (onSelectTeacher) {
                              onSelectTeacher(prof);
                              showToast(`Switched active teacher view to ${prof.name}`);
                            }
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Switch to profile &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Question #{editingQuestion.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Select strictly ONE single correct answer option (no multiple answers allowed).
                </p>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Text:
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.questionText}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const optValue =
                  optKey === 'A' ? editingQuestion.optionA :
                  optKey === 'B' ? editingQuestion.optionB :
                  optKey === 'C' ? editingQuestion.optionC : editingQuestion.optionD;

                return (
                  <div key={optKey} className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold w-20 flex-shrink-0">
                      <input
                        type="radio"
                        name="correctChoice"
                        checked={editingQuestion.correctOption === optKey}
                        onChange={() =>
                          setEditingQuestion({ ...editingQuestion, correctOption: optKey })
                        }
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Option {optKey}:</span>
                    </label>
                    <input
                      type="text"
                      value={optValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (optKey === 'A') setEditingQuestion({ ...editingQuestion, optionA: val });
                        if (optKey === 'B') setEditingQuestion({ ...editingQuestion, optionB: val });
                        if (optKey === 'C') setEditingQuestion({ ...editingQuestion, optionC: val });
                        if (optKey === 'D') setEditingQuestion({ ...editingQuestion, optionD: val });
                      }}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Single-Choice Question
                </h3>
                <p className="text-xs text-slate-500">
                  Paper: {selectedExam.title} &bull; 1 Mark (No multiple answers allowed)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Prompt:
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the question text..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const val =
                  optKey === 'A' ? newOptA :
                  optKey === 'B' ? newOptB :
                  optKey === 'C' ? newOptC : newOptD;

                const setter =
                  optKey === 'A' ? setNewOptA :
                  optKey === 'B' ? setNewOptB :
                  optKey === 'C' ? setNewOptC : setNewOptD;

                return (
                  <div key={optKey} className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold w-20 flex-shrink-0">
                      <input
                        type="radio"
                        name="newCorrectChoice"
                        checked={newCorrect === optKey}
                        onChange={() => setNewCorrect(optKey)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Option {optKey}:</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Choice ${optKey} text`}
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required={optKey === 'A' || optKey === 'B'}
                    />
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
