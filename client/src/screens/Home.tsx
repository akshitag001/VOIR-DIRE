import { useNavigate } from 'react-router-dom';
import { getProjects, getSessionsForProject } from '../sessionStore';
import { Gavel, Plus, BookOpen, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const projects = getProjects();

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <div className="border-b-2 border-brass pb-8 mb-12 text-center">
        <div className="flex justify-center mb-6">
          <Gavel className="w-16 h-16 text-brass" />
        </div>
        <h1 className="text-6xl font-serif-header mb-4 text-mahogany tracking-tight">The Stand</h1>
        <p className="text-xl italic text-ink/80">
          "The Ultimate Moot Court Preparation Simulator."
        </p>
      </div>

      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-serif-header text-mahogany">Your Dockets</h2>
        <button
          onClick={() => navigate('/setup')}
          className="flex items-center gap-2 bg-oxblood hover:bg-mahogany text-parchment px-6 py-3 font-serif-header rounded-sm transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Moot
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-brass/50 bg-white/30 rounded-sm">
          <BookOpen className="w-12 h-12 text-brass/50 mx-auto mb-4" />
          <h3 className="text-2xl font-serif-header text-ink/70 mb-2">No Moots Found</h3>
          <p className="text-ink/60">Create your first moot project to begin preparing.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => {
            const sessions = getSessionsForProject(project.id);
            return (
              <div key={project.id} className="border border-brass/50 bg-white/60 p-6 rounded-sm shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brass/30 group-hover:bg-brass transition-colors" />
                <h3 className="text-2xl font-serif-header font-bold text-mahogany mb-2">{project.name}</h3>
                
                <div className="flex items-center gap-4 text-sm text-ink/70 mb-6">
                   <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {sessions.length} Prep Sessions</div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate(`/strategy/${project.id}`)}
                    className="flex-1 bg-mahogany text-parchment py-2 font-serif-header hover:bg-oxblood transition-colors rounded-sm text-center"
                  >
                    Start New Session
                  </button>
                </div>
                
                {sessions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-brass/20 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Recent Sessions</p>
                    {sessions.slice(-3).reverse().map(session => (
                      <div key={session.id} className="flex justify-between items-center text-sm p-2 bg-white/40 border border-brass/10">
                        <span><span className="font-bold">{session.role}</span> - {new Date(session.date).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/arguments/${session.id}`)} className="text-oxblood hover:underline text-xs">Oral Arg</button>
                          <span className="text-brass/30">|</span>
                          <button onClick={() => navigate(`/rebuttal/${session.id}`)} className="text-oxblood hover:underline text-xs">Rebuttal</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
