import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getProject, saveRebuttals } from '../sessionStore';
import { BookOpen } from 'lucide-react';

export default function Rebuttal() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = getSession(sessionId || '');
  const project = session ? getProject(session.projectId) : null;

  const [loading, setLoading] = useState(false);
  const [rebuttals, setRebuttals] = useState(session?.rebuttals || []);

  useEffect(() => {
    if (session && project && rebuttals.length === 0) {
      generateRebuttals();
    }
  }, []);

  if (!session || !project) {
    return <div className="p-12 text-center">Session not found.</div>;
  }

  const generateRebuttals = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      const res = await fetch(`${API_URL}/api/rebuttal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposition: project.proposition,
          issues: project.issues,
          role: session.role
        })
      });
      const data = await res.json();
      if (data.rebuttals) {
        setRebuttals(data.rebuttals);
        saveRebuttals(session.id, data.rebuttals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const opponentRole = session.role === 'Applicant' ? 'Defendant' : 'Applicant';

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 pb-24">
      <div className="flex items-center justify-between border-b-2 border-brass pb-6 mb-8">
        <div>
          <p className="text-sm font-bold text-ink/60 uppercase tracking-widest mb-1">Rebuttal Prep Assistant</p>
          <h1 className="text-4xl font-serif-header text-mahogany">Anticipating the {opponentRole}</h1>
        </div>
        <button onClick={() => navigate('/')} className="text-ink/60 hover:text-oxblood underline">
          Back to Docket
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mahogany mx-auto mb-4"></div>
          <p className="text-xl text-ink/70 animate-pulse">The AI Coach is analyzing the proposition to predict the {opponentRole}'s arguments...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-ink/80 leading-relaxed max-w-3xl">
            Based on the factual matrix and issues presented, here are the three strongest arguments opposing counsel is likely to make, along with suggested rebuttal strategies.
          </p>

          <div className="grid gap-8">
            {rebuttals.map((r, idx) => (
              <div key={idx} className="border border-brass/50 bg-white/60 rounded-sm shadow-sm relative overflow-hidden flex flex-col md:flex-row">
                <div className="absolute top-0 left-0 w-2 h-full bg-oxblood/80" />
                
                <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-brass/30 bg-white/40">
                  <h3 className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-2">Opponent's Likely Argument</h3>
                  <p className="text-lg font-serif-header text-mahogany font-bold leading-snug">
                    "{r.opponentArgument}"
                  </p>
                </div>

                <div className="p-6 md:w-1/2 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Your Rebuttal Strategy</h3>
                    <p className="text-ink leading-relaxed">
                      {r.suggestedRebuttal}
                    </p>
                  </div>
                  <div className="bg-parchment/50 p-4 border-l-2 border-brass">
                    <h3 className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Piercing Cross-Question</h3>
                    <p className="italic text-ink/80">"{r.crossQuestion}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-6">
            <button
              onClick={generateRebuttals}
              className="bg-white border border-mahogany text-mahogany px-8 py-3 text-lg font-serif-header hover:bg-mahogany/5 transition-colors rounded-sm shadow-sm"
            >
              Regenerate Strategy
            </button>
            <button
              onClick={() => navigate(`/arguments/${session.id}`)}
              className="bg-mahogany text-parchment px-8 py-3 text-lg font-serif-header hover:bg-oxblood transition-colors rounded-sm shadow-sm flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Proceed to Oral Arguments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
