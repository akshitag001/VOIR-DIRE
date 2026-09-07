import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import MootSetup from './screens/MootSetup';
import Strategy from './screens/Strategy';
import OralArguments from './screens/OralArguments';
import Rebuttal from './screens/Rebuttal';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-parchment text-ink font-serif-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<MootSetup />} />
          <Route path="/strategy/:projectId" element={<Strategy />} />
          <Route path="/arguments/:sessionId" element={<OralArguments />} />
          <Route path="/rebuttal/:sessionId" element={<Rebuttal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
