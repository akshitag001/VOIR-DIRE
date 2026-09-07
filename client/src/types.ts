export interface MootProject {
  id: string;
  name: string;
  proposition: string;
  rules: string;
  issues: string;
}

export interface ArgumentTurn {
  role: 'student' | 'judge';
  text: string;
  timestamp: string;
}

export interface RebuttalIdea {
  opponentArgument: string;
  suggestedRebuttal: string;
  crossQuestion: string;
}

export interface Session {
  id: string;
  projectId: string;
  role: 'Applicant' | 'Defendant';
  memorial: string;
  date: string;
  transcript: ArgumentTurn[];
  rebuttals: RebuttalIdea[];
}
