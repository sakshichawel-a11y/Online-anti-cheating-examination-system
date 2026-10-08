import React, { useState } from 'react';
import { CODE_GUIDE_PARTS } from '../data/codeGuideData';
import { 
  BookOpen, 
  Code, 
  Copy, 
  Check, 
  Layers, 
  HelpCircle, 
  ChevronRight, 
  Terminal, 
  Database, 
  FileCode, 
  ShieldCheck,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';

interface MicroprojectGuideViewProps {
  initialPartId?: number;
  onLaunchPortal: () => void;
}

export const MicroprojectGuideView: React.FC<MicroprojectGuideViewProps> = ({
  initialPartId = 0,
  onLaunchPortal,
}) => {
  const [selectedPartId, setSelectedPartId] = useState(initialPartId);
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);
  const [activeDiagramTab, setActiveDiagramTab] = useState<'usecase' | 'dfd0' | 'dfd1' | 'er' | 'architecture'>('usecase');

  const currentPart = CODE_GUIDE_PARTS.find((p) => p.id === selectedPartId) || CODE_GUIDE_PARTS[0];

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedFileIndex(index);
    setTimeout(() => {
      setCopiedFileIndex(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-700/50 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-300/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Diploma IT Microproject Roadmap (Parts 0–10)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Online Examination System with Anti-Cheating Mechanism
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Complete project architectural plan, requirements specification, UML/DFD/ER diagrams, SQLite database schemas, Flask backend source files, and viva preparation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLaunchPortal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Live Exam Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Parts Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-24">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Roadmap Milestones
              </h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Parts 0 – 10
              </span>
            </div>

            <div className="space-y-1">
              {CODE_GUIDE_PARTS.map((part) => {
                const isSelected = part.id === selectedPartId;
                return (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-blue-800 text-blue-100 font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {part.partNumber}
                      </span>
                      <span className="truncate">{part.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Microproject Summary Info */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Tech Stack:</span>
              </div>
              <p className="text-[11px]">
                Python 3 &bull; Flask &bull; SQLite &bull; HTML5 &bull; Bootstrap 5 &bull; JavaScript
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Active Part Documentation & Code (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Part Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {currentPart.partNumber}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {currentPart.badge}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {currentPart.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {currentPart.summary}
              </p>
            </div>

            {/* Content Sections */}
            {currentPart.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {sec.body}
                </p>
                {sec.bullets && (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pl-2">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="text-blue-600 font-bold mt-0.5">&bull;</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Part 0 Visual Flowchart */}
            {currentPart.id === 0 && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Visual Examination Lifecycle Diagram
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-xs">
                    1. Student Login
                  </div>
                  <div className="p-2.5 bg-slate-200 text-slate-800 rounded-xl font-medium">
                    2. Dashboard
                  </div>
                  <div className="p-2.5 bg-slate-200 text-slate-800 rounded-xl font-medium">
                    3. Instructions
                  </div>
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-xs">
                    4. Start Exam
                  </div>
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-xs">
                    5. Anti-Cheat Engine
                  </div>
                  <div className="p-2.5 bg-slate-200 text-slate-800 rounded-xl font-medium">
                    6. Submit Exam
                  </div>
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                    7. Server Evaluation
                  </div>
                  <div className="p-2.5 bg-blue-800 text-white rounded-xl font-bold shadow-xs">
                    8. Result & History
                  </div>
                </div>
              </div>
            )}

            {/* Part 2 Interactive System Diagrams (Use Case, DFD 0, DFD 1, ER Diagram, Architecture) */}
            {currentPart.id === 2 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Interactive Engineering Diagrams</span>
                  </h4>
                  <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['usecase', 'dfd0', 'dfd1', 'er', 'architecture'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveDiagramTab(tab)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeDiagramTab === tab
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab === 'usecase' && 'Use Case'}
                        {tab === 'dfd0' && 'DFD Level 0'}
                        {tab === 'dfd1' && 'DFD Level 1'}
                        {tab === 'er' && 'ER Diagram'}
                        {tab === 'architecture' && '3-Tier Arch'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Render Selected Diagram */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-inner overflow-x-auto min-h-[300px] flex items-center justify-center">
                  {activeDiagramTab === 'usecase' && (
                    <div className="w-full max-w-lg space-y-4 text-center">
                      <div className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                        UML USE CASE DIAGRAM (Online Examination System)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="p-4 bg-blue-950 border border-blue-700 rounded-xl text-center">
                          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                            Actor
                          </div>
                          <div className="font-bold text-sm text-white">Student</div>
                          <div className="text-[11px] text-blue-300">Candidate User</div>
                        </div>

                        <div className="sm:col-span-2 space-y-2 text-left text-xs">
                          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-blue-200 flex items-center justify-between">
                            <span>&bull; Login to Examination Portal</span>
                            <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">&lt;&lt;include&gt;&gt;</span>
                          </div>
                          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-blue-200 flex items-center justify-between">
                            <span>&bull; View Instructions & Agree to Rules</span>
                            <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">&lt;&lt;include&gt;&gt;</span>
                          </div>
                          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-blue-200 flex items-center justify-between">
                            <span>&bull; Answer MCQ Questions with Timer</span>
                            <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">&lt;&lt;core&gt;&gt;</span>
                          </div>
                          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-amber-200 flex items-center justify-between">
                            <span>&bull; Trigger Anti-Cheating Surveillance</span>
                            <span className="text-[10px] bg-amber-900 px-1.5 py-0.5 rounded">&lt;&lt;extend&gt;&gt;</span>
                          </div>
                          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-emerald-200 flex items-center justify-between">
                            <span>&bull; Submit & View Verified Result</span>
                            <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">&lt;&lt;include&gt;&gt;</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDiagramTab === 'dfd0' && (
                    <div className="w-full max-w-md space-y-4 text-center">
                      <div className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                        DATA FLOW DIAGRAM (LEVEL 0 - CONTEXT DIAGRAM)
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                        <div className="p-3 bg-blue-900 border border-blue-600 rounded-xl text-xs font-bold">
                          [External Entity]<br/>STUDENT
                        </div>
                        <div className="text-xs text-blue-300 font-mono flex flex-col items-center">
                          <span>Credentials / Answers ➔</span>
                          <span className="text-emerald-400"> Results / Warnings</span>
                        </div>
                        <div className="w-32 h-32 rounded-full bg-indigo-700 border-2 border-indigo-400 flex flex-col items-center justify-center p-2 text-center text-xs font-bold shadow-lg">
                          <span>0.0</span>
                          <span>ONLINE EXAM</span>
                          <span>SYSTEM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDiagramTab === 'dfd1' && (
                    <div className="w-full max-w-lg space-y-3 text-xs">
                      <div className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider text-center">
                        DATA FLOW DIAGRAM (LEVEL 1 - DECOMPOSED SUB-PROCESSES)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                          <strong className="text-amber-400">1.0 User Authentication:</strong>
                          <p className="text-[11px] text-slate-300 mt-1">Verifies email & password_hash with D1: Students table.</p>
                        </div>
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                          <strong className="text-blue-400">2.0 Exam Session Engine:</strong>
                          <p className="text-[11px] text-slate-300 mt-1">Pulls questions from D2: Questions; creates record in D3: Attempts.</p>
                        </div>
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                          <strong className="text-red-400">3.0 Anti-Cheat Guard:</strong>
                          <p className="text-[11px] text-slate-300 mt-1">Logs tab switch, blur, fullscreen exits to D4: Cheating_Logs.</p>
                        </div>
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                          <strong className="text-emerald-400">4.0 Server Evaluation:</strong>
                          <p className="text-[11px] text-slate-300 mt-1">Evaluates answers vs correct_option; updates total_score in D3.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDiagramTab === 'er' && (
                    <div className="w-full space-y-4 text-xs">
                      <div className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider text-center">
                        ENTITY-RELATIONSHIP (ER) RELATIONAL MODEL
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl">
                          <div className="font-bold text-amber-300 border-b border-blue-800 pb-1 mb-1.5">STUDENTS</div>
                          <div className="text-[11px] text-blue-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>&bull; name, email</div>
                            <div>&bull; password_hash</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl">
                          <div className="font-bold text-amber-300 border-b border-blue-800 pb-1 mb-1.5">EXAMS</div>
                          <div className="text-[11px] text-blue-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>&bull; title, subject</div>
                            <div>&bull; duration, marks</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl">
                          <div className="font-bold text-amber-300 border-b border-blue-800 pb-1 mb-1.5">QUESTIONS</div>
                          <div className="text-[11px] text-blue-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>🔗 exam_id (FK)</div>
                            <div>&bull; options A-D, correct</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl">
                          <div className="font-bold text-emerald-300 border-b border-blue-800 pb-1 mb-1.5">ATTEMPTS</div>
                          <div className="text-[11px] text-blue-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>🔗 student_id, exam_id</div>
                            <div>&bull; score, warning_count</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl">
                          <div className="font-bold text-emerald-300 border-b border-blue-800 pb-1 mb-1.5">ANSWERS</div>
                          <div className="text-[11px] text-blue-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>🔗 attempt_id, question_id</div>
                            <div>&bull; selected_option</div>
                          </div>
                        </div>

                        <div className="p-3 bg-rose-950 border border-rose-800 rounded-xl">
                          <div className="font-bold text-rose-300 border-b border-rose-800 pb-1 mb-1.5">CHEATING_LOGS</div>
                          <div className="text-[11px] text-rose-200 space-y-0.5 font-mono">
                            <div>🔑 id (PK)</div>
                            <div>🔗 attempt_id (FK)</div>
                            <div>&bull; event_type, warning_no</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDiagramTab === 'architecture' && (
                    <div className="w-full max-w-lg space-y-3 text-xs text-center">
                      <div className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                        3-TIER CLIENT-SERVER-DATABASE ARCHITECTURE
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-900 border border-blue-700 rounded-xl">
                          <strong>Presentation Tier (Client Browser)</strong>
                          <p className="text-[11px] text-blue-200">HTML5 &bull; Bootstrap 5 &bull; anti_cheat.js &bull; exam.js &bull; Fullscreen API</p>
                        </div>
                        <div className="text-blue-400 font-mono text-[11px]">↕ HTTP / REST JSON Requests</div>
                        <div className="p-3 bg-indigo-900 border border-indigo-700 rounded-xl">
                          <strong>Application Logic Tier (Python / Flask)</strong>
                          <p className="text-[11px] text-indigo-200">app.py &bull; routes/auth.py &bull; routes/exam.py &bull; routes/result.py &bull; Evaluation Engine</p>
                        </div>
                        <div className="text-indigo-400 font-mono text-[11px]">↕ SQL Parameterized Queries</div>
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                          <strong>Database Tier (SQLite)</strong>
                          <p className="text-[11px] text-slate-300">exam_system.db &bull; ACID Transactions &bull; Foreign Key Integrity</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source Code Files with Copy Button */}
            {currentPart.files && currentPart.files.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Production Source Code ({currentPart.files.length} Files)</span>
                </h4>

                <div className="space-y-4">
                  {currentPart.files.map((f, fIdx) => (
                    <div key={fIdx} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-800 text-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">
                            {f.language}
                          </span>
                          <span className="font-semibold text-white">{f.path}</span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(f.code, fIdx)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedFileIndex === fIdx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-96">
                        <pre className="leading-relaxed">{f.code}</pre>
                      </div>

                      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                        <strong>Description:</strong> {f.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Viva Preparation Q&A */}
            {currentPart.vivaQuestions && currentPart.vivaQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>External Viva Examination Q&A</span>
                </h4>

                <div className="space-y-3">
                  {currentPart.vivaQuestions.map((vq, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1.5"
                    >
                      <div className="font-bold text-amber-950 flex items-start gap-2">
                        <span className="text-amber-600 font-mono">Q:</span>
                        <span>{vq.question}</span>
                      </div>
                      <div className="text-slate-700 leading-relaxed pl-4">
                        <strong className="text-emerald-800">Answer:</strong> {vq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
