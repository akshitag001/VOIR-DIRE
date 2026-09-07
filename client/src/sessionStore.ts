import type { Session, MootProject, ArgumentTurn, RebuttalIdea } from './types';

const SESSIONS_KEY = 'the_stand_sessions_v2';
const PROJECTS_KEY = 'the_stand_projects_v2';

// --- Projects ---
export const getProjects = (): MootProject[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getProject = (id: string): MootProject | undefined => {
  return getProjects().find(p => p.id === id);
};

export const createProject = (name: string, proposition: string, rules: string, issues: string): MootProject => {
  const projects = getProjects();
  const newProject: MootProject = {
    id: `proj_${Date.now()}`,
    name,
    proposition,
    rules,
    issues
  };
  projects.push(newProject);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return newProject;
};

// --- Sessions ---
export const getSessions = (): Session[] => {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSession = (id: string): Session | undefined => {
  return getSessions().find(s => s.id === id);
};

export const getSessionsForProject = (projectId: string): Session[] => {
  return getSessions().filter(s => s.projectId === projectId);
};

export const createSession = (projectId: string, role: 'Applicant' | 'Defendant', memorial: string): Session => {
  const sessions = getSessions();
  const newSession: Session = {
    id: `sess_${Date.now()}`,
    projectId,
    role,
    memorial,
    date: new Date().toISOString(),
    transcript: [],
    rebuttals: []
  };
  sessions.push(newSession);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return newSession;
};

export const addTurnToSession = (sessionId: string, turn: ArgumentTurn) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    sessions[index].transcript.push(turn);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
};

export const saveRebuttals = (sessionId: string, rebuttals: RebuttalIdea[]) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    sessions[index].rebuttals = rebuttals;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
};
