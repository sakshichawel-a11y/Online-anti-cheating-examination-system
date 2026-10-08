import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  AlertOctagon, 
  Radio as RadioIcon, 
  Search, 
  Filter, 
  Eye, 
  Megaphone, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  UserX,
  Volume2
} from 'lucide-react';
import { CandidateLiveStatus, InvigilatorProfile, ProctorAlert } from '../types';

interface InvigilatorViewProps {
  invigilator: InvigilatorProfile;
  candidates: CandidateLiveStatus[];
  alerts: ProctorAlert[];
  onBackToDashboard?: () => void;
}

export const InvigilatorView: React.FC<InvigilatorViewProps> = ({
  invigilator,
  candidates: initialCandidates,
  alerts: initialAlerts,
  onBackToDashboard,
}) => {
  const [candidates, setCandidates] = useState<CandidateLiveStatus[]>(initialCandidates);
  const [alerts, setAlerts] = useState<ProctorAlert[]>(initialAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NORMAL' | 'WARNED' | 'CRITICAL' | 'TERMINATED'>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateLiveStatus | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('Maintain proper camera posture and keep eyes on screen.');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Issue warning to candidate
  const handleIssueWarning = (candidateId: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const newStrikes = Math.min(3, c.strikes + 1);
          const newStatus = newStrikes >= 3 ? 'TERMINATED' : newStrikes === 2 ? 'CRITICAL' : 'WARNED';
          return {
            ...c,
            strikes: newStrikes,
            status: newStatus,
            lastEvent: `Proctor Warning: ${warningMessage}`,
            lastEventTime: new Date().toLocaleTimeString(),
          };
        }
        return c;
      })
    );

    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      const newAlert: ProctorAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        candidateName: cand.name,
        rollNumber: cand.rollNumber,
        eventType: 'INVIGILATOR_DIRECT_WARNING',
        description: `Proctor ${invigilator.name} issued formal warning: "${warningMessage}"`,
        severity: cand.strikes + 1 >= 3 ? 'critical' : 'high',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    setShowWarningModal(false);
    showToast(`Warning issued to candidate. Strike count incremented.`);
  };

  // Terminate exam for candidate
  const handleTerminateCandidate = (candidateId: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            strikes: 3,
            status: 'TERMINATED',
            cameraLive: false,
            micLive: false,
            faceDetected: false,
            lastEvent: 'Disqualified by Invigilator for Academic Misconduct',
            lastEventTime: new Date().toLocaleTimeString(),
          };
        }
        return c;
      })
    );

    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      const newAlert: ProctorAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        candidateName: cand.name,
        rollNumber: cand.rollNumber,
        eventType: 'FORCE_DISQUALIFICATION',
        description: `Proctor ${invigilator.name} disqualified ${cand.name} (${cand.rollNumber}) for severe malpractice.`,
        severity: 'critical',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    showToast(`Candidate exam terminated and locked.`);
  };

  // Request 360 room scan
  const handleRequestRoomScan = (cand: CandidateLiveStatus) => {
    showToast(`360° Room Scan protocol requested for ${cand.name}.`);
    const newAlert: ProctorAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      candidateName: cand.name,
      rollNumber: cand.rollNumber,
      eventType: 'ROOM_SCAN_REQUESTED',
      description: 'Invigilator demanded 360-degree environment sweep verification.',
      severity: 'medium',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Send Broadcast to all
  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    showToast(`Announcement broadcast to all candidates in ${invigilator.roomAssigned}.`);
    setShowBroadcastModal(false);
    setBroadcastMessage('');
  };

  // Filtered Candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalNormal = candidates.filter((c) => c.status === 'NORMAL').length;
  const totalWarned = candidates.filter((c) => c.status === 'WARNED').length;
  const totalCritical = candidates.filter((c) => c.status === 'CRITICAL').length;
  const totalTerminated = candidates.filter((c) => c.status === 'TERMINATED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <RadioIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Invigilator Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Requirement 24: Anti-Cheating Alert Disclaimer */}
        <div className="mb-4 p-3.5 bg-amber-500/15 border border-amber-400/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important:</strong> Anti-cheating alerts are indicators for review and should not automatically be treated as proof of academic misconduct. Authorized examination personnel should review relevant evidence and apply applicable examination rules before taking any action.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={invigilator.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={invigilator.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span>Invigilator Command Center &bull; Live Hall Feed</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {invigilator.name}
                <span className="text-xs font-mono font-normal bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {invigilator.employeeCode}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {invigilator.department} &bull; <span className="text-emerald-400 font-semibold">{invigilator.roomAssigned}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={() => showToast('Candidate CCTV feeds synced and refreshed.')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refresh Feeds</span>
            </button>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Active</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{candidates.length} Candidates</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
              <span>Clean / Normal</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{totalNormal} Candidates</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
              <span>Flagged / Warned</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{totalWarned + totalCritical} Candidates</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-red-400 font-semibold flex items-center justify-between">
              <span>Disqualified</span>
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400 mt-1">{totalTerminated} Expelled</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Webcam Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar: Search & Filter Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, roll, PRN..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['ALL', 'NORMAL', 'WARNED', 'CRITICAL', 'TERMINATED'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setStatusFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === filterKey
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Video Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate) => {
              const isTerminated = candidate.status === 'TERMINATED';
              const isCritical = candidate.status === 'CRITICAL';
              const isWarned = candidate.status === 'WARNED';

              return (
                <div
                  key={candidate.id}
                  className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden flex flex-col ${
                    isTerminated
                      ? 'border-red-300 bg-red-50/20'
                      : isCritical
                      ? 'border-orange-400 ring-2 ring-orange-400/20'
                      : isWarned
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {/* Video Box / Simulation */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden flex items-center justify-center">
                    {isTerminated ? (
                      <div className="text-center p-4 text-red-400 space-y-1">
                        <UserX className="w-8 h-8 mx-auto text-red-500" />
                        <div className="text-xs font-bold uppercase tracking-wider">Exam Disqualified</div>
                        <div className="text-[10px] text-slate-400">Stream Terminated &bull; Strike Limit Hit</div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover filter contrast-105 brightness-95"
                        />
                        
                        {/* Computer Vision Face Bounding Box Overlay */}
                        {candidate.faceDetected ? (
                          <div className="absolute inset-6 border-2 border-emerald-400/90 rounded-lg pointer-events-none flex items-start justify-between p-1.5">
                            <span className="text-[9px] font-mono bg-black/75 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              Face Verified 99%
                            </span>
                            <span className="text-[9px] font-mono bg-emerald-500/80 text-white px-1.5 py-0.5 rounded">
                              Attentive
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-4 border-2 border-dashed border-red-500 bg-red-950/40 rounded-lg pointer-events-none flex items-center justify-center p-2 text-center text-red-300 text-xs font-bold">
                            ⚠️ FACE NOT DETECTED IN FRAME
                          </div>
                        )}

                        {/* Top Stream Badges */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            LIVE
                          </span>

                          <div className="flex items-center gap-1">
                            {candidate.cameraLive ? (
                              <Video className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <VideoOff className="w-3.5 h-3.5 text-red-400" />
                            )}
                            {candidate.micLive ? (
                              <Mic className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <MicOff className="w-3.5 h-3.5 text-red-400" />
                            )}
                          </div>
                        </div>

                        {/* Audio Wave Bar Indicator */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-slate-300">
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <div className="flex items-end gap-0.5 h-2.5">
                            <span className="w-0.5 h-1.5 bg-emerald-400 rounded" />
                            <span className="w-0.5 h-2.5 bg-emerald-400 rounded" />
                            <span className="w-0.5 h-1 bg-emerald-400 rounded" />
                            <span className="w-0.5 h-2 bg-emerald-400 rounded" />
                          </div>
                        </div>

                        {/* Bottom Name Overlay */}
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">
                          {candidate.rollNumber}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Candidate Details & Actions */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {candidate.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTerminated
                              ? 'bg-red-100 text-red-700'
                              : isCritical
                              ? 'bg-orange-100 text-orange-700'
                              : isWarned
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                        <span>{candidate.examTitle}</span>
                        <span className="font-semibold text-slate-700">
                          {candidate.questionsAnswered} / {candidate.totalQuestions} Qs
                        </span>
                      </div>

                      {/* Strike Indicator Progress */}
                      <div className="flex items-center gap-1.5 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-semibold text-[10px]">Strikes:</span>
                        <div className="flex items-center gap-1 flex-1">
                          {[1, 2, 3].map((s) => (
                            <div
                              key={s}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                s <= candidate.strikes
                                  ? s === 3
                                    ? 'bg-red-600'
                                    : s === 2
                                    ? 'bg-orange-500'
                                    : 'bg-amber-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[10px]">
                          {candidate.strikes}/3
                        </span>
                      </div>

                      {/* Last Event */}
                      <div className="text-[11px] text-slate-600 bg-slate-50/60 p-2 rounded-lg mt-2 border border-slate-100 flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="truncate">
                          <span className="font-semibold text-slate-800">{candidate.lastEventTime}:</span>{' '}
                          {candidate.lastEvent}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowWarningModal(true);
                        }}
                        disabled={isTerminated}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Issue formal proctor warning and strike"
                      >
                        ⚠️ Warn (+1)
                      </button>

                      <button
                        onClick={() => handleRequestRoomScan(candidate)}
                        disabled={isTerminated}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Require candidate to pan webcam 360 degrees"
                      >
                        🔄 360° Scan
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Disqualify candidate ${candidate.name} immediately for severe academic malpractice?`)) {
                            handleTerminateCandidate(candidate.id);
                          }
                        }}
                        disabled={isTerminated}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-bold border border-red-200 transition text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Force terminate and expel candidate"
                      >
                        🚫 Terminate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No candidates found matching the selected filter or search keyword.
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Forensic Violation Stream (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-900">Live Incident Ticker</h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Auto-Monitored
              </span>
            </div>

            {/* Alert List */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isHigh = alert.severity === 'high';
                const isMedium = alert.severity === 'medium';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition ${
                      isCritical
                        ? 'bg-red-50/80 border-red-200 text-red-950'
                        : isHigh
                        ? 'bg-orange-50/80 border-orange-200 text-orange-950'
                        : isMedium
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold">{alert.candidateName}</span>
                      <span className="font-mono text-[10px] text-slate-500">{alert.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold mb-1">
                      {isCritical ? (
                        <AlertOctagon className="w-3 h-3 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{alert.eventType.replace(/_/g, ' ')}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center justify-between">
                      <span>Roll: {alert.rollNumber}</span>
                      <span className="uppercase font-semibold tracking-wider text-[9px]">
                        Severity: {alert.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hall Rules Summary */}
          <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Invigilator Hall Protocols</span>
            </h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
              <li>Strike 1: Candidate warned, yellow alert recorded.</li>
              <li>Strike 2: Candidate video highlighted orange, room scan requested.</li>
              <li>Strike 3: Automated termination and lock out enforced.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Warning Issue Modal */}
      {showWarningModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Issue Formal Warning</span>
              </h3>
              <button
                onClick={() => setShowWarningModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">Candidate:</span> {selectedCandidate.name}</div>
              <div><span className="font-semibold text-slate-700">Roll No:</span> {selectedCandidate.rollNumber}</div>
              <div><span className="font-semibold text-slate-700">Current Strikes:</span> {selectedCandidate.strikes} of 3</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Warning Message / Reason:</label>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleIssueWarning(selectedCandidate.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow transition"
              >
                Record Strike & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <span>Broadcast to Examination Hall</span>
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This message will flash as an urgent announcement modal on the screens of all {candidates.length} active candidates in {invigilator.roomAssigned}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Text:</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. 15 minutes remaining. Ensure all questions are marked properly."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
