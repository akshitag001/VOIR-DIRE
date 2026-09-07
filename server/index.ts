import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.6-flash';

// Endpoint 1: Judge Simulator
app.post('/api/judge', async (req, res) => {
  try {
    const { proposition, rules, issues, role, memorial, studentArgument, transcript } = req.body;

    // Build the transcript string for context
    const transcriptText = transcript.map((t: any) => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

    const systemInstruction = `You are a highly analytical, formal Moot Court Judge. 
The student appearing before you is representing the ${role.toUpperCase()}.
Moot Proposition: ${proposition}
Rules & Regulations: ${rules}
Issues at hand: ${issues}
Student's Written Memorial: ${memorial}

Rules for your response:
1. Act exclusively as the Judge. Do not break character.
2. If the student makes an assertion that ignores a bad fact in the proposition, or glosses over a complex legal rule, interrupt them with a piercing, skeptical question.
3. If their argument is sound, you may simply say "Proceed, Counsel," or ask them to move to their next issue.
4. Keep your response under 3-4 sentences. It should sound like spoken courtroom dialogue.
5. Consider the context of the conversation so far:
${transcriptText}`;

    const prompt = `The student argues: "${studentArgument}"\n\nRespond with ONLY your spoken reply as the Judge.`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction
        }
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error('Error in /api/judge:', error);
    res.status(500).json({ error: 'Failed to generate judge response' });
  }
});

// Endpoint 2: Rebuttal Assistant
app.post('/api/rebuttal', async (req, res) => {
    try {
      const { proposition, issues, role } = req.body;
      const opponentRole = role === 'Applicant' ? 'Defendant' : 'Applicant';
  
      const prompt = `You are a Moot Court strategy coach.
The student is representing the ${role}.
Moot Proposition: ${proposition}
Issues: ${issues}

Predict the strategy of the opposing counsel (${opponentRole}). Provide exactly 3 of their strongest likely arguments, and for each, provide a suggested rebuttal for the student to use, and a piercing cross-question if they were allowed to ask one.

Return ONLY valid JSON in this exact shape:
{
  "rebuttals": [
    {
      "opponentArgument": "...",
      "suggestedRebuttal": "...",
      "crossQuestion": "..."
    }
  ]
}`;
  
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
      });
  
      const jsonResponse = JSON.parse(response.text || '{}');
      res.json(jsonResponse);
    } catch (error) {
      console.error('Error in /api/rebuttal:', error);
      res.status(500).json({ error: 'Failed to generate rebuttals' });
    }
});

// Endpoint 3: PDF Extraction
app.post('/api/extract-pdf', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      const rawText = pdfData.text;
      await parser.destroy();
  
      const prompt = `You are a legal assistant. Analyze the following moot court proposition document and extract key information. 
Return ONLY valid JSON in this exact shape:
{
  "name": "The name of the moot competition or case",
  "proposition": "A concise summary of the factual matrix (do not lose important details, max 1000 words)",
  "rules": "Any specific rules, jurisdiction, or applicable laws mentioned",
  "issues": "A numbered list of the legal issues/questions to be argued"
}

Document Text:
${rawText.substring(0, 30000)} // Limiting to first ~30k chars to avoid token limits, usually enough for the core facts.
`;
  
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
      });
  
      const jsonResponse = JSON.parse(response.text || '{}');
      res.json(jsonResponse);
    } catch (error) {
      console.error('Error in /api/extract-pdf:', error);
      res.status(500).json({ error: 'Failed to extract PDF details' });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
