export type PolicyTab = 
  | 'privacy' 
  | 'consent' 
  | 'terms' 
  | 'retention' 
  | 'grievance';

export interface DataRetentionRule {
  category: string;
  purpose: string;
  retentionPeriod: string;
  legalBasis: string;
}

export interface ConsentRecord {
  id: string;
  studentId: number;
  studentRoll: string;
  examId: number;
  policyVersion: string;
  consentTimestamp: string;
  consentType: string;
  cameraConsent: boolean;
  micConsent: boolean;
  browserMonitorConsent: boolean;
  automatedAlertReviewConsent: boolean;
}

export interface AuditLogEntry {
  id: string;
  adminId: number;
  adminName: string;
  action: 
    | 'EXAM_CREATED' 
    | 'EXAM_UPDATED' 
    | 'EXAM_DELETED' 
    | 'REGISTRATION_APPROVED' 
    | 'REGISTRATION_REJECTED' 
    | 'RESULT_PUBLISHED' 
    | 'ALERT_REVIEWED' 
    | 'STUDENT_RECORD_ACCESSED' 
    | 'RETENTION_POLICY_UPDATED'
    | 'GRIEVANCE_RESOLVED';
  targetRecord: string;
  timestamp: string;
  ipSession: string;
  actionResult: 'SUCCESS' | 'FAILED' | 'PENDING';
  details?: string;
}

export interface PrivacyOfficerConfig {
  officerTitle: string;
  officeDepartment: string;
  email: string;
  phone: string;
  roomAddress: string;
  hours: string;
  grievancePortalUrl: string;
}

export interface PolicyMetadata {
  privacyPolicyVersion: string;
  effectiveDate: string;
  consentTextVersion: string;
  monitoringPolicyVersion: string;
}
