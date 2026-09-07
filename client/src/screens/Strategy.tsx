import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, createSession } from '../sessionStore';

export default function Strategy() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = getProject(projectId || '');

  const [role, setRole] = useState<'Applicant' | 'Defendant'>('Applicant');
  const [memorial, setMemorial] = useState('');

  if (!project) {
    return <div className="p-12 text-center text-oxblood">Moot Project not found.</div>;
  }

  const handleStartSession = () => {
    const session = createSession(project.id, role, memorial);
    navigate(`/arguments/${session.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="border-b border-brass pb-6 mb-8 flex justify-between items-end">
        <div>
          <p className="text-sm font-bold text-ink/60 uppercase tracking-widest mb-1">Session Strategy</p>
          <h1 className="text-4xl font-serif-header text-mahogany">{project.name}</h1>
        </div>
        <button onClick={() => navigate('/')} className="text-ink/60 hover:text-oxblood underline mb-2">
          Back to Docket
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-serif-header font-bold text-mahogany mb-4">1. Choose Your Role</h2>
          <div className="flex gap-4">
            {(['Applicant', 'Defendant'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-4 border rounded-sm font-serif-header text-xl ${role === r ? 'bg-oxblood text-parchment border-oxblood shadow-md' : 'bg-white/50 border-brass/40 text-ink/70 hover:bg-white/80'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif-header font-bold text-mahogany mb-2">2. Upload Memorial (Written Submission)</h2>
          <p className="text-sm text-ink/70 mb-4">Paste the text of your memorial here. The Judge will read this to anticipate your arguments and find holes in your logic. (Optional but highly recommended).</p>
          <textarea 
            className="w-full h-64 bg-white/80 border border-brass/50 p-4 rounded-sm focus:outline-none focus:border-oxblood resize-none text-sm leading-relaxed"
            placeholder="Paste your memorial here..."
            value={memorial}
            onChange={(e) => setMemorial(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => {
              const session = createSession(project.id, role, memorial);
              navigate(`/rebuttal/${session.id}`);
            }}
            className="bg-white border border-mahogany text-mahogany px-6 py-4 text-lg font-serif-header hover:bg-mahogany/5 transition-colors rounded-sm shadow-sm"
          >
            Prep Rebuttals Instead
          </button>
          <button
            onClick={handleStartSession}
            className="bg-mahogany text-parchment px-8 py-4 text-lg font-serif-header hover:bg-oxblood transition-colors rounded-sm shadow-sm"
          >
            Approach the Bench (Oral Arguments)
          </button>
        </div>
      </div>
    </div>
  );
}
