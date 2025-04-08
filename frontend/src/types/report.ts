interface InterviewDetail {
  'actual round': string;
  feedback: string;
}

interface InterviewDate {
  date: string;
  interviews: InterviewDetail[][];
}

interface CompanyDetail {
  company: string;
  is_po: boolean;
  interview_dates: InterviewDate[];
}

export interface RoundTotals {
  '1st': number;
  '2nd': number;
  '3rd': number;
  'Assessment': number;
  'B.Assessment': number;
  'Final': number;
  'Screening': number;
  'Technical': number;
  [key: string]: number;
}

export interface Candidate {
  candidateName: string;
  expertName: string;
  is_in_po: boolean;
  round_totals: RoundTotals;
  cumulative_total: number;
  details: CompanyDetail[];
}

export interface ExpertStats {
  expert: string;
  roundCounts: RoundTotals;
  totalInterviews: number;
  candidates: string[];
  candidateRoundCounts: Record<string, Record<string, number>>;
  interviewsByCandidate: Record<string, Array<{
    company: string;
    is_po: boolean;
    date: string;
    round: string;
    feedback: string;
  }>>;
}

export type ReportData = Candidate[];