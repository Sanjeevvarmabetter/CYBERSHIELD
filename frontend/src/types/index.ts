export type UserRole = 'CITIZEN' | 'ANALYST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IndicatorItem {
  type: string;
  name: string;
  description: string;
  severity: RiskLevel;
}

export interface AnalysisResult {
  analysis_type: string;
  predicted_category: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  detection_indicators: IndicatorItem[];
  explanation: string;
  recommended_actions: string[];
  limitations?: string;
  reference_id?: string;
}

export interface IncidentReport {
  id: string;
  reference_code: string;
  category: string;
  title: string;
  description: string;
  status: 'SUBMITTED' | 'RECEIVED' | 'UNDER_REVIEW' | 'INFO_REQUIRED' | 'CLOSED' | 'REFERRED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_anonymous: boolean;
  consent_share_intel: boolean;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ThreatIndicator {
  id: string;
  indicator_type: string;
  normalized_value: string;
  defanged_value: string;
  verification_status: 'UNVERIFIED' | 'UNDER_REVIEW' | 'CORROBORATED' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
  confidence_score: number;
  first_seen: string;
  last_seen: string;
  source_provenance: string;
  times_reported: number;
  tags: string[];
}

export interface SafetyGuide {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  severity: string;
  overview: string;
  how_it_operates: string[];
  warning_signs: string[];
  prevention_steps: string[];
  if_affected: string[];
}
