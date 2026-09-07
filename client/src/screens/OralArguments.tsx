import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getProject, addTurnToSession } from '../sessionStore';
import { Gavel } from 'lucide-react';

export default function OralArguments() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = getSession(sessionId || '');
  const project = session ? getProject(session.projectId) : null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.transcript, loading]);

  if (!session || !project) {
    return <div className="p-12 text-center">Session not found.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const studentArg = input.trim();
    setInput('');
    setLoading(true);

    // Save student turn immediately to state/store to show in UI
    addTurnToSession(session.id, { role: 'student', text: studentArg, timestamp: new Date().toISOString() });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      const judgeRes = await fetch(`${API_URL}/api/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposition: project.proposition,
          rules: project.rules,
          issues: project.issues,
          role: session.role,
          memorial: session.memorial,
          studentArgument: studentArg,
          transcript: session.transcript
        })
      });
      const judgeData = await judgeRes.json();
      const answer = judgeData.answer || 'The judge stares blankly. Please proceed, counsel.';

      addTurnToSession(session.id, { role: 'judge', text: answer, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      addTurnToSession(session.id, { 
        role: 'judge', 
        text: 'The judge pauses and looks confused. (Connection error)',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-parchment">
      {/* Top Bar */}
      <div className="bg-mahogany text-parchment p-4 shadow-md z-10 flex justify-between items-center border-b-4 border-brass">
        <div className="flex items-center gap-3">
          <Gavel className="w-6 h-6 text-brass" />
          <div>
             <div className="font-serif-header font-bold tracking-widest text-sm uppercase">Oral Arguments: {project.name}</div>
             <div className="text-xs text-brass/70">{session.role} Submissions</div>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="text-sm underline hover:text-brass">Return to Chambers</button>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 md:px-24 pb-32" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center text-ink/50 italic mb-10 border-b border-brass/20 pb-4">
            The court is now in session. Counsel for the {session.role}, you may proceed with your oral arguments.
          </div>

          {session.transcript.map((turn, idx) => (
            <div key={idx} className={`p-4 border-l-4 ${turn.role === 'student' ? 'border-mahogany bg-white/40 ml-12' : 'border-brass bg-[#EAE1D0]/60 mr-12'}`}>
              <div className="font-bold uppercase tracking-wider text-xs mb-2 text-ink/60">
                {turn.role === 'student' ? `Counsel (${session.role})` : 'The Judge'}
              </div>
              <p className={`text-lg leading-relaxed ${turn.role === 'judge' ? 'font-serif-header text-mahogany' : 'text-ink'}`}>
                "{turn.text}"
              </p>
            </div>
          ))}

          {loading && (
            <div className="p-4 border-l-4 border-brass bg-[#EAE1D0]/60 mr-12 animate-pulse">
               <div className="font-bold uppercase tracking-wider text-xs mb-2 text-ink/60">The Judge</div>
               <p className="text-ink/60 italic text-lg">The judge is reviewing the proposition and your memorial...</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-brass/40 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your oral argument submission here..."
            className="w-full bg-parchment/30 border border-brass/50 px-4 py-3 rounded-sm focus:outline-none focus:border-oxblood resize-none h-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-ink/50">Press Enter to submit, Shift+Enter for new line.</span>
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-oxblood text-parchment px-8 py-2 font-serif-header hover:bg-mahogany disabled:opacity-50 transition-colors rounded-sm shadow-sm"
            >
              Submit Argument
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
