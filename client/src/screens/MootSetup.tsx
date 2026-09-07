import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../sessionStore';

import { Upload } from 'lucide-react';

export default function MootSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [proposition, setProposition] = useState('');
  const [rules, setRules] = useState('');
  const [issues, setIssues] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      const res = await fetch(`${API_URL}/api/extract-pdf`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.name) setName(data.name);
      if (data.proposition) setProposition(data.proposition);
      if (data.rules) setRules(data.rules);
      if (data.issues) setIssues(data.issues);
    } catch (err) {
      console.error(err);
      alert('Failed to parse PDF. Please try copying and pasting instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name || !proposition || !issues) {
      alert("Please fill in the Moot Name, Proposition, and Issues.");
      return;
    }
    const project = createProject(name, proposition, rules, issues);
    navigate(`/strategy/${project.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between border-b-2 border-brass pb-6 mb-8">
        <h1 className="text-4xl font-serif-header text-mahogany">Configure Moot Project</h1>
        <button onClick={() => navigate('/')} className="text-ink/60 hover:text-oxblood underline">
          Cancel
        </button>
      </div>

      <div className="space-y-8 bg-white/50 p-8 border border-brass/40 shadow-sm relative">
        <div className="absolute -left-[1px] top-4 bottom-4 w-[2px] bg-oxblood/80"></div>

        <div className="bg-parchment/60 border-2 border-dashed border-brass/50 p-8 text-center rounded-sm relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oxblood mb-2"></div>
               <p className="text-mahogany font-serif-header animate-pulse">AI is reading your moot guidelines...</p>
            </div>
          )}
          <Upload className="w-10 h-10 text-brass mx-auto mb-4" />
          <h3 className="text-xl font-serif-header text-mahogany font-bold mb-2">Auto-Fill from PDF</h3>
          <p className="text-sm text-ink/70 mb-4 max-w-md mx-auto">Drop your moot proposition or rules PDF here. The AI will read it and instantly fill out all the details below.</p>
          <label className="bg-brass text-white px-6 py-2 rounded-sm cursor-pointer hover:bg-brass/90 transition-colors inline-block font-bold text-sm tracking-wider uppercase">
            Upload PDF
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="text-center">
          <span className="text-ink/30 font-bold uppercase tracking-widest text-xs relative">
            <span className="bg-[#f3f0e8] px-4 relative z-10">Or manually enter</span>
            <span className="absolute top-1/2 left-[-100px] right-[-100px] h-[1px] bg-brass/20"></span>
          </span>
        </div>

        <div>
          <label className="block text-xl font-serif-header font-bold text-mahogany mb-2">Moot Name / Competition</label>
          <input 
            type="text" 
            className="w-full bg-white/80 border border-brass/50 p-3 rounded-sm focus:outline-none focus:border-oxblood"
            placeholder="e.g., 14th Annual Vis Moot"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xl font-serif-header font-bold text-mahogany mb-2">The Proposition (Fact Matrix)</label>
          <p className="text-sm text-ink/70 mb-2">Copy and paste the full facts of the moot problem here. The AI Judge will use this to challenge your facts.</p>
          <textarea 
            className="w-full h-48 bg-white/80 border border-brass/50 p-4 rounded-sm focus:outline-none focus:border-oxblood resize-none text-sm"
            placeholder="Paste proposition..."
            value={proposition}
            onChange={(e) => setProposition(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xl font-serif-header font-bold text-mahogany mb-2">Issues to be Argued</label>
          <p className="text-sm text-ink/70 mb-2">List the specific legal questions or issues raised in the proposition.</p>
          <textarea 
            className="w-full h-24 bg-white/80 border border-brass/50 p-4 rounded-sm focus:outline-none focus:border-oxblood resize-none text-sm"
            placeholder="1. Whether the contract was breached...&#10;2. Whether damages are applicable..."
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xl font-serif-header font-bold text-mahogany mb-2">Rules & Regulations (Optional)</label>
          <p className="text-sm text-ink/70 mb-2">Any specific moot rules (e.g., jurisdictions, laws applicable).</p>
          <textarea 
            className="w-full h-24 bg-white/80 border border-brass/50 p-4 rounded-sm focus:outline-none focus:border-oxblood resize-none text-sm"
            placeholder="Laws of the Republic of India apply..."
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-oxblood text-parchment px-8 py-4 text-xl font-serif-header hover:bg-mahogany transition-colors rounded-sm shadow-sm"
        >
          Create & Proceed to Strategy
        </button>
      </div>
    </div>
  );
}
