import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Database, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Building2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Clock, 
  Eye, 
  HelpCircle,
  Camera,
  Mic,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { PolicyTab, DataRetentionRule, PrivacyOfficerConfig, PolicyMetadata } from '../types/privacy';

interface PolicyPagesModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
  retentionRules?: DataRetentionRule[];
  privacyOfficer?: PrivacyOfficerConfig;
  policyMetadata?: PolicyMetadata;
}

export const DEFAULT_RETENTION_RULES: DataRetentionRule[] = [
  {
    category: 'Student Profile (Identity, Roll, Branch, Photo Baseline)',
    purpose: 'Student identification, admission verification & examination records',
    retentionPeriod: 'Duration of course enrolment + 5 years (Autonomous Statute)',
    legalBasis: 'Academic Administration & Institute Regulatory Compliance'
  },
  {
    category: 'Examination Registrations & Hall Tickets',
    purpose: 'Seat allocation, invigilator duty rooster, and candidate authentication',
    retentionPeriod: '3 years after conclusion of academic semester',
    legalBasis: 'Examination Board Records & Audit'
  },
  {
    category: 'Candidate Answers & Question Responses',
    purpose: 'Evaluation, moderation, rechecking, and challenge evaluation',
    retentionPeriod: '2 years post result declaration or until grievance closure',
    legalBasis: 'Academic Integrity & Examination Verification'
  },
  {
    category: 'Official Results & Transcripts',
    purpose: 'Permanent diploma issuance and institutional verification',
    retentionPeriod: 'Permanent archival (Autonomous Institute Repository)',
    legalBasis: 'Statutory Board of Technical Education Record'
  },
  {
    category: 'Monitoring Alerts & Proctoring Event Logs',
    purpose: 'Exam integrity investigation and forensic committee review',
    retentionPeriod: '90 days post result publication (or until inquiry completes)',
    legalBasis: 'Academic Malpractice Investigation'
  },
  {
    category: 'Raw Audio/Video Media (if captured during inquiry)',
    purpose: 'Evidence review only in escalated malpractice disputes',
    retentionPeriod: 'Minimum necessary period (purged within 30 days of case disposal)',
    legalBasis: 'Data Minimization Principle'
  }
];

export const DEFAULT_PRIVACY_OFFICER: PrivacyOfficerConfig = {
  officerTitle: 'Autonomous Examination Grievance & Data Protection Officer',
  officeDepartment: 'Examination Cell, Main Administrative Building',
  email: 'coe.office@gppune.ac.in',
  phone: '+91 (020) 2567-6818 / Ext: 204',
  roomAddress: 'Room 104, Ground Floor, Govt. Polytechnic Pune, Ganeshkhind, Pune-411016',
  hours: 'Monday to Friday: 10:30 AM – 04:30 PM (Except Public Holidays)',
  grievancePortalUrl: 'https://www.gppune.ac.in/grievance'
};

export const DEFAULT_POLICY_METADATA: PolicyMetadata = {
  privacyPolicyVersion: 'v2.4 (GPP-Autonomous)',
  effectiveDate: 'September 28, 2026',
  consentTextVersion: 'v2.1',
  monitoringPolicyVersion: 'v3.0'
};

export const PolicyPagesModal: React.FC<PolicyPagesModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  retentionRules = DEFAULT_RETENTION_RULES,
  privacyOfficer = DEFAULT_PRIVACY_OFFICER,
  policyMetadata = DEFAULT_POLICY_METADATA
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 relative border-b border-blue-800/40 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-400/30 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Government Polytechnic Pune (Autonomous) Academic Project / Prototype
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
              {policyMetadata.privacyPolicyVersion}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Institutional Privacy & Examination Policies
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Data protection, candidate rights, anti-cheating monitoring framework, and retention governance.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-2 border-t border-slate-700/60 pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('consent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consent'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Consent & Monitoring
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Terms of Use
            </button>
            <button
              onClick={() => setActiveTab('retention')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'retention'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Data Retention
            </button>
            <button
              onClick={() => setActiveTab('grievance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'grievance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Student Rights & Grievance
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Examination Privacy Policy ({policyMetadata.privacyPolicyVersion})
                </h3>
                <span className="text-xs text-slate-500">Effective: {policyMetadata.effectiveDate}</span>
              </div>

              <p className="text-xs text-slate-600">
                This policy explains how the <strong>Online Anti-Cheating Examination Registration System</strong> handles your personal information. As an academic project/prototype designed for <strong>Government Polytechnic Pune</strong>, privacy is embedded as an essential core principle.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Clear Data Differentiation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <strong className="text-slate-900 block mb-1 text-blue-800">1. Required Academic Information</strong>
                    <p className="text-slate-600">
                      Collected for identification and academic records: Student Name, Roll Number, PRN, Email, Mobile, Course, Branch, Semester, Baseline Photo, Enrolled Exams, Answers & Results.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <strong className="text-slate-900 block mb-1 text-amber-800">2. Examination Monitoring Information</strong>
                    <p className="text-slate-600">
                      Collected <em>strictly only</em> while an online exam session is running: Camera events (multiple faces, no face), microphone audio levels, window/tab focus shifts, fullscreen state, and proctor review alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Data Minimization Principle</h4>
                <p className="text-xs text-slate-600">
                  The system enforces strict data minimization:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li>No continuous storage of raw webcam video or microphone audio recordings.</li>
                  <li>Only event-driven metadata markers are logged (e.g., <code>"MULTIPLE_FACES_DETECTED at 10:42:31"</code>).</li>
                  <li>No device files, personal media, browsing history, or background tabs outside the exam window are ever inspected.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Who Can Access Your Data?</h4>
                <p className="text-xs text-slate-600">
                  Access is restricted strictly through Role-Based Access Control (RBAC):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li><strong>Student:</strong> Accesses solely their own profile, registered papers, scorecards, and alerts generated during their own exam. Students can never view any other candidate’s records.</li>
                  <li><strong>Invigilator / Faculty:</strong> Views live candidate monitoring cards and submissions for the exam room they are assigned to manage.</li>
                  <li><strong>Examination Controller / Super Admin:</strong> Manages institutional exam papers, official result publication, and reviews flagged cases alongside committee members.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: CONSENT & MONITORING */}
          {activeTab === 'consent' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Consent & Monitoring Policy ({policyMetadata.monitoringPolicyVersion})
                </h3>
                <span className="text-xs text-slate-500">Consent Text: {policyMetadata.consentTextVersion}</span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Explicit Informed Consent is Mandatory</strong>
                  The system will <strong>never automatically turn on your webcam or microphone</strong>. Before any monitored exam begins, you must review the dedicated consent screen and explicitly agree via unchecked checkboxes. Browser permissions are requested separately after your informed consent.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">7-Step Monitored Examination Sequence</h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <span className="px-2 py-1 bg-white rounded shadow-xs">1. Privacy Notice</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-white rounded shadow-xs">2. Monitoring Explanation</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-white rounded shadow-xs">3. Explicit Checkbox Consent</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-white rounded shadow-xs">4. Browser Camera Permission</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-white rounded shadow-xs">5. Browser Mic Permission</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-white rounded shadow-xs">6. System Check</span>
                  <span>&rarr;</span>
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded shadow-xs">7. Start Exam</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Anti-Cheating Alert Disclaimer & Human Adjudication</h4>
                <p className="text-slate-600">
                  <strong>Important:</strong> Automated proctoring alerts (e.g. face lost, tab blur, audio surge) are merely <em>indicators for review</em> and should not automatically be treated as proof of academic misconduct. Authorized examination personnel review all flagged alerts alongside network logs and human explanations before any action is contemplated.
                </p>
                <p className="text-slate-600">
                  The system <strong>never</strong> automatically declares a student guilty, never automatically fails an exam solely because of one alert, and never imposes penalties without human examination committee review.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Monitoring Transparency During The Exam</h4>
                <p className="text-xs text-slate-600">
                  During an active exam, a high-visibility badge:
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 font-bold text-xs rounded-full border border-red-300">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>🔴 EXAM MONITORING ACTIVE</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Students can click the “Monitoring Information” pill at any time to verify camera state, microphone level, active alerts, why monitoring is occurring, and who is authorized to review the logs.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF USE */}
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Institutional Terms of Examination Use
                </h3>
                <span className="text-xs text-slate-500">Autonomous Board Code 2026</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <h4 className="font-bold text-slate-900 text-sm">1. Candidate Code of Conduct</h4>
                <p>
                  Candidates registered for online tests conducted through this platform agree to maintain the highest standards of academic integrity. Impersonation, use of secondary computing devices, unauthorized reference materials, or intentional obstruction of webcams during testing constitutes academic misconduct.
                </p>

                <h4 className="font-bold text-slate-900 text-sm pt-2">2. Hardware and Environment Requirements</h4>
                <p>
                  Candidates must ensure they possess a functional desktop/laptop or supported device equipped with a working webcam, microphone, stable internet connection, and an updated modern browser. The testing area should be well-illuminated and free from secondary persons.
                </p>

                <h4 className="font-bold text-slate-900 text-sm pt-2">3. Institutional Prototype Status</h4>
                <p className="p-3 bg-slate-100 rounded-xl border border-slate-200 italic">
                  &ldquo;This application is developed as an academic project/demo for Government Polytechnic Pune and is not an official Government Polytechnic Pune examination portal unless formally authorized by the institute.&rdquo;
                </p>

                <h4 className="font-bold text-slate-900 text-sm pt-2">4. Disciplinary Procedure</h4>
                <p>
                  In the event of anomalous activity flags during an examination, the candidate’s attempt is tagged for review by the Institute Examination Malpractice Inquiry Committee. The candidate has a guaranteed right to present their explanation before any formal action is finalized.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DATA RETENTION */}
          {activeTab === 'retention' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  Institutional Data Retention Schedule
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                  Configurable by Institute Admin
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Personal and examination data is not kept indefinitely. In compliance with data minimization rules, each information category has a defined retention schedule established by the Autonomous Examination Committee.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Data Category</th>
                      <th className="p-3">Institutional Purpose</th>
                      <th className="p-3">Retention Period</th>
                      <th className="p-3">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {retentionRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900">{rule.category}</td>
                        <td className="p-3 text-slate-600">{rule.purpose}</td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                            {rule.retentionPeriod}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">{rule.legalBasis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong>Note on Media Purging:</strong> Raw webcam snapshots and audio streams are stored only when a severe malpractice review is initiated. Routine clean sessions retain only mathematical alert markers (e.g. strike counts) and zero raw audio/video files.
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT RIGHTS & GRIEVANCE */}
          {activeTab === 'grievance' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  Student Privacy Rights & Grievance Mechanism
                </h3>
                <span className="text-xs text-slate-500">Fair Examination Guarantee</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Your Guaranteed Rights
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li><strong>Right to Informed Consent:</strong> Transparent explanation before any surveillance hardware is initiated.</li>
                    <li><strong>Right to Data Inspection:</strong> Review your stored profile, registered exams, and review remarks.</li>
                    <li><strong>Right to Dispute Alerts:</strong> Challenge any automated alert indicator before a human review panel.</li>
                    <li><strong>Right to Withdrawal of Consent:</strong> Withdraw monitoring consent through the designated grievance route (note: withdrawing mandatory exam consent may prevent online participation in monitored papers).</li>
                    <li><strong>Right to Grievance Redressal:</strong> Formal appeal of evaluation, marks moderation, or invigilator actions.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <h4 className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Contact Examination Administration
                  </h4>
                  <p className="text-slate-600">
                    If you have privacy concerns, technical accessibility issues, or wish to file an examination dispute:
                  </p>
                  
                  <div className="space-y-1.5 pt-1 text-slate-700 font-medium">
                    <div className="font-bold text-blue-900">{privacyOfficer.officerTitle}</div>
                    <div className="text-slate-600">{privacyOfficer.officeDepartment}</div>
                    <div className="flex items-center gap-1.5 text-blue-700">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${privacyOfficer.email}`} className="hover:underline">{privacyOfficer.email}</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{privacyOfficer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{privacyOfficer.hours}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] pt-1">
                      {privacyOfficer.roomAddress}
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={privacyOfficer.grievancePortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                    >
                      <span>Open Grievance Desk</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Withdrawing Consent & Examination Access Route</h4>
                <p className="text-slate-600">
                  Participation in an anti-cheating monitored exam legitimately requires camera and microphone event processing to ensure institutional degree validity. If a candidate cannot provide consent due to medical, technical, or personal privacy reasons, they should contact the <strong>Autonomous Examination Cell</strong> at least 48 hours prior to the test to register for an on-campus offline written session or request approved physical invigilation accommodations.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Official Portal:</span>
            <a 
              href="https://www.gppune.ac.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>gppune.ac.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500">Autonomous Institute of Govt. of Maharashtra</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              I Understand & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
