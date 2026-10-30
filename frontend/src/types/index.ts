export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'faculty';
  reg_number?: string;
  department?: string;
  created_at?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  degree: string;
  current_year: number;
  cgpa: number;
  aptitude_score: number;
  technical_score: number;
  communication_score: number;
  coding_score: number;
  projects_count: number;
  internships_count: number;
  certifications_count: number;
  technical_skills: string;
  backlogs_count: number;
  interview_prep_level: string;
  resume_readiness: number;
  updated_at?: string;
}

export interface Prediction {
  id: number;
  assessment_id: number;
  user_id: number;
  readiness_category: 'Placement Ready' | 'Developing' | 'Needs Preparation';
  readiness_score: number;
  probability_ready: number;
  probability_developing: number;
  probability_needs_prep: number;
  strongest_areas: string[];
  improvement_areas: string[];
  created_at: string;
  disclaimer: string;
}

export interface Recommendation {
  id: number;
  user_id: number;
  assessment_id?: number;
  area: string;
  reason: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Assessment {
  id: number;
  user_id: number;
  cgpa: number;
  aptitude_score: number;
  technical_score: number;
  communication_score: number;
  coding_score: number;
  projects_count: number;
  internships_count: number;
  certifications_count: number;
  backlogs_count: number;
  resume_readiness: number;
  interview_prep_level: string;
  created_at: string;
  prediction?: Prediction;
  recommendations: Recommendation[];
}

export interface AssessmentWithResult {
  assessment: Assessment;
  prediction: Prediction;
  recommendations: Recommendation[];
}

export interface StudentDashboardSummary {
  user: User;
  profile?: StudentProfile;
  latest_assessment?: Assessment;
  latest_prediction?: Prediction;
  recommendations: Recommendation[];
  assessment_count: number;
  completed_recommendations_count: number;
  total_recommendations_count: number;
}

export interface DepartmentStats {
  department: string;
  student_count: number;
  assessed_count: number;
  avg_cgpa: number;
  placement_ready_count: number;
}

export interface ReadinessDistribution {
  placement_ready: number;
  developing: number;
  needs_preparation: number;
}

export interface AdminStats {
  total_students: number;
  assessed_students: number;
  unassessed_students: number;
  total_assessments: number;
  avg_cgpa: number;
  avg_technical_score: number;
  avg_coding_score: number;
  avg_aptitude_score: number;
  readiness_distribution: ReadinessDistribution;
  department_summary: DepartmentStats[];
}

export interface StudentListItem {
  id: number;
  full_name: string;
  email: string;
  reg_number?: string;
  department?: string;
  created_at: string;
  has_profile: boolean;
  cgpa?: number;
  assessments_count: number;
  latest_readiness_category?: string;
  latest_readiness_score?: number;
  latest_assessment_date?: string;
}

export interface StudentDetail {
  user: User;
  profile?: StudentProfile;
  assessments: Assessment[];
  recommendations: Recommendation[];
}
