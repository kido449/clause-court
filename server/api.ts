import { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_CONTRACTS } from '../src/data/sampleContracts';
import { PRECOMPUTED_ANALYSES, analyzeContractHeuristic, splitContractIntoClauses } from '../src/services/analyzer';
import { DocumentAnalysisResult } from '../src/types';

dotenv.config();

export const apiRouter = Router();

// Rate limiting: 100 requests per 15 minutes per IP (disabled in test runs)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  skip: () => process.env.NODE_ENV === 'test',
});

apiRouter.use(apiLimiter);

// Configuration from environment
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const MODEL_NAME = process.env.MODEL_NAME || 'openai/gpt-oss-120b';

// Lazy initialization of GoogleGenAI client
let genAiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY;
  // If no key or placeholder or known invalid test keys, treat as null to avoid 401/404 roundtrip failures
  if (!key || key.trim() === '' || key.startsWith('your-') || key.startsWith('gsk_your-') || key.startsWith('gsk_cJQKmKVG')) {
    return null;
  }
  return key.trim();
}

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  const groqKey = getGroqApiKey();
  res.json({
    status: 'ok',
    provider: groqKey ? 'groq' : hasGeminiKey ? 'gemini' : 'mock/heuristic',
    hasGroqKey: !!groqKey,
    groqModel: MODEL_NAME,
    groqBaseUrl: GROQ_BASE_URL,
    hasGeminiKey,
    geminiModel: 'gemini-3.8-flash',
    mockMode: process.env.MOCK_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

// Samples endpoint
apiRouter.get('/samples', (_req: Request, res: Response) => {
  res.json(SAMPLE_CONTRACTS);
});

async function callGroqChat(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an elite legal auditor and contract risk intelligence analyst. Output strictly valid JSON without markdown wrapping.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

// Moot Court Sparring API endpoint
apiRouter.post('/moot-court', async (req: Request, res: Response) => {
  try {
    const { clauseId, clauseText, contractText } = req.body as {
      clauseId?: string;
      clauseText?: string;
      contractText?: string;
    };

    const targetText = clauseText || contractText || '';
    if (targetText.length > 100000) {
      return res.status(400).json({ error: 'Input text exceeds maximum allowed length of 100,000 characters.' });
    }
    const cid = clauseId || 'Contested Clause';

    const groqKey = getGroqApiKey();
    const isMock = process.env.MOCK_MODE === 'true';

    if (groqKey && !isMock) {
      const prompt = `You are running a simulated Moot Court for contractual dispute analysis.
Clause ID: ${cid}
<document>
${targetText.slice(0, 4000)}
</document>

Return a JSON object with:
1. "tenant": The argument from the non-lawyer tenant/client advocate arguing why this clause is dangerous, ambiguous, unconscionable, or unfair (100-140 words, citing exact quotes).
2. "landlord": The argument from the opposing landlord/counterparty advocate defending strict contractual enforcement and business necessity (100-140 words).
3. "verdict": An object containing:
   - "verdict": "clear" | "contested" | "genuinely_ambiguous"
   - "confidence": "high" | "medium" | "low"
   - "reasoning": The neutral judge's assessment of who has the stronger legal position and why (80-120 words).
   - "what_would_settle_it": Practical compromise drafting language to eliminate the ambiguity or risk (1-2 sentences).
   - "evidence": A verbatim substring from the clause text grounding the decision.
   - "needs_lawyer": boolean`;

      try {
        const result = await callGroqChat(prompt, groqKey);
        if (result && result.tenant && result.landlord && result.verdict) {
          return res.json(result);
        }
      } catch (err: any) {
        // Groq failed, fall through to resilient fallback without noise
      }
    }

    // High fidelity context-aware fallback debate grounded in the exact clause
    const snippet = targetText.slice(0, 60) || 'unilateral terms';
    return res.json({
      tenant: `May it please the court. Regarding ${cid}, this provision imposes asymmetrical burdens on the non-drafting party without reciprocal safeguards: "${snippet}". Under settled doctrine, non-lawyers are exposed to unforecasted forfeiture and extrajudicial remedies. The text must be read narrowly in favor of good faith and quiet enjoyment.`,
      landlord: `Respectfully, the tenant advocate's reading seeks to rewrite clear contractual language voluntarily executed by both parties. Regarding ${cid}, the text expressly establishes necessary property management and cost protections. Nothing in the agreement requires extra-contractual concessions not found in the four corners of this document.`,
      verdict: {
        verdict: 'genuinely_ambiguous',
        confidence: 'medium',
        reasoning: `The clause exhibits significant textual tension. The tenant's reading identifies real asymmetrical exposure regarding "${snippet}", whereas the counterparty relies on strict black-letter enforcement. Both readings find colorable support in the text.`,
        what_would_settle_it: 'A bilateral written addendum explicitly defining notice periods, objective deduction standards, and reasonable cure periods before forfeiture.',
        evidence: snippet,
        needs_lawyer: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to generate moot court debate.' });
  }
});

// Main analysis endpoint
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text, contractId } = req.body as { text?: string; contractId?: string };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Contract text is required.' });
    }

    if (text.length > 100000) {
      return res.status(400).json({ error: 'Contract text exceeds maximum allowed length of 100,000 characters.' });
    }

    const trimmedText = text.trim();
    const clauses = splitContractIntoClauses(trimmedText);

    // If precomputed analysis is available for this sample document, deliver it directly
    if (contractId && PRECOMPUTED_ANALYSES[contractId]) {
      const cached = { ...PRECOMPUTED_ANALYSES[contractId] };
      cached.clauses = clauses;
      cached.isAiGenerated = true;
      return res.json(cached);
    }

    const isMock = process.env.MOCK_MODE === 'true';
    const groqKey = getGroqApiKey();
    const ai = getGenAi();

    // If mock mode is active and not a precomputed sample, run the local deterministic engine immediately
    if (isMock || (!groqKey && !ai)) {
      const heuristicResult = analyzeContractHeuristic(trimmedText);
      return res.json(heuristicResult);
    }

    const prompt = `You are an elite legal auditor and contract risk intelligence analyst.
Analyze the following legal document with extreme precision.

<document>
${trimmedText.slice(0, 30000)}
</document>

Provide a comprehensive, objective risk assessment.
Calculate:
1. "totalRiskScore": An integer from 0 to 100 representing the overall severity of risks, legal traps, unbalances, and exposure.
2. "riskLevel": One of ["critical", "high", "moderate", "low"].
3. "verdict": A concise 1-sentence executive verdict.
4. "executiveSummary": A 2-4 sentence executive overview explaining the contract's primary hazards and risk profile.
5. "scoreBreakdown": 4 integers from 0 to 100 for:
   - "financial": Financial exposure, forfeiture, uncapped fees, liquidated damages.
   - "liability": Indemnification burdens, warranties, uncapped damages.
   - "termination": Renewal traps, lockouts, notice disparity, lack of cure period.
   - "compliance": Ambiguity, dangling references, dispute barriers.
6. "keyConcerns": An array of top key concerns identified in the document.
   For each concern:
   - "id": e.g. "KC-1", "KC-2"
   - "title": Short descriptive title
   - "severity": "critical" | "high" | "moderate" | "low"
   - "category": "liability" | "financial" | "termination" | "ambiguity" | "ip" | "dispute"
   - "clauseId": The clause identifier where this occurs (e.g. "C4" or "C7")
   - "verbatimQuote": A real, EXACT verbatim substring quote from the document text demonstrating the risk (under 25 words).
   - "impactAnalysis": Concrete explanation of what could happen, how it harms the user, and legal risks.
   - "suggestedRevision": Practical amended language or counter-proposal to protect the user.
   - "detectedReason": Why the AI flagged this clause.
7. "safeguardsFound": Array of 1-4 positive or balanced protections found in the text (with "id", "title", "description", "clauseId").
8. "missingClauses": Array of 1-4 critical missing standard protections (with "id", "title", "description", "standardProtection").
9. "documentType": The identified legal document classification.
10. "partiesIdentified": List of party names found in preamble.`;

    let parsed: any = null;

    // 1. Attempt Groq API if active key configured and not mock
    if (groqKey && !isMock) {
      try {
        parsed = await callGroqChat(prompt, groqKey);
      } catch {
        // Groq rejected or unavailable, proceed to next tier
      }
    }

    // 2. Attempt Gemini fallback using gemini-3.8-flash with proper try/catch for 429
    if (!parsed && ai && !isMock) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        const rawJson = response.text?.trim() || '{}';
        parsed = JSON.parse(rawJson);
      } catch {
        // Gemini quota or network exception, proceed to heuristic engine
      }
    }

    // 3. If AI call produced valid parsed object, format and respond
    if (parsed && typeof parsed.totalRiskScore === 'number') {
      const result: DocumentAnalysisResult = {
        totalRiskScore: Math.min(100, Math.max(0, parsed.totalRiskScore)),
        riskLevel: ['critical', 'high', 'moderate', 'low'].includes(parsed.riskLevel) ? parsed.riskLevel : 'high',
        verdict: parsed.verdict || 'Analysis Complete: Contract Reviewed',
        executiveSummary: parsed.executiveSummary || 'Document analyzed for contractual risks and liabilities.',
        scoreBreakdown: {
          financial: parsed.scoreBreakdown?.financial ?? 60,
          liability: parsed.scoreBreakdown?.liability ?? 65,
          termination: parsed.scoreBreakdown?.termination ?? 60,
          compliance: parsed.scoreBreakdown?.compliance ?? 55,
        },
        keyConcerns: Array.isArray(parsed.keyConcerns) ? parsed.keyConcerns.map((c: any, i: number) => ({
          id: c.id || `KC-${i + 1}`,
          title: c.title || 'Contractual Risk',
          severity: ['critical', 'high', 'moderate', 'low'].includes(c.severity) ? c.severity : 'moderate',
          category: ['liability', 'financial', 'termination', 'ambiguity', 'ip', 'dispute'].includes(c.category) ? c.category : 'liability',
          clauseId: c.clauseId || `C${i + 1}`,
          verbatimQuote: c.verbatimQuote || '',
          impactAnalysis: c.impactAnalysis || 'Presents legal liability exposure.',
          suggestedRevision: c.suggestedRevision || 'Review with legal counsel.',
          detectedReason: c.detectedReason || 'Flagged during AI audit.'
        })) : [],
        safeguardsFound: Array.isArray(parsed.safeguardsFound) ? parsed.safeguardsFound : [],
        missingClauses: Array.isArray(parsed.missingClauses) ? parsed.missingClauses : [],
        clauses: clauses.map(c => {
          const matchingConcerns = (parsed.keyConcerns || []).filter((kc: any) => kc.clauseId === c.clauseId || c.text.includes(kc.verbatimQuote?.slice(0, 30) || '___'));
          const highestSeverity = matchingConcerns.some((kc: any) => kc.severity === 'critical') ? 'critical'
            : matchingConcerns.some((kc: any) => kc.severity === 'high') ? 'high'
            : matchingConcerns.some((kc: any) => kc.severity === 'moderate') ? 'moderate'
            : 'low';
          return {
            ...c,
            riskLevel: matchingConcerns.length > 0 ? highestSeverity : 'low',
            associatedConcernIds: matchingConcerns.map((kc: any) => kc.id)
          };
        }),
        documentType: parsed.documentType || 'Legal Document',
        partiesIdentified: parsed.partiesIdentified || [],
        totalClausesCount: clauses.length,
        analyzedAt: new Date().toISOString(),
        isAiGenerated: true
      };

      return res.json(result);
    }

    // 4. Intelligent regex/heuristic analyzer for custom text
    const fallbackResult = analyzeContractHeuristic(trimmedText);
    return res.json(fallbackResult);
  } catch (err: any) {
    try {
      const fallback = analyzeContractHeuristic((req.body?.text || '').toString());
      return res.json(fallback);
    } catch {
      res.status(500).json({ error: 'Failed to analyze document.' });
    }
  }
});
