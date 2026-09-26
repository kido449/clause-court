# Decisions Log

- D01: Configured hybrid mono-repo with backend/ and src/ for single-container preview while preserving standalone backend/frontend execution.
- D02: Replaced Azure OpenAI with free Groq API (llama-3.3-70b-versatile). Defaulted MOCK_MODE to true when GROQ_API_KEY is not provided so local and offline demo works out-of-the-box.
- D03: Used Vite proxy to route /api requests to FastAPI on port 8000 for seamless single-origin developer experience on port 3000.
- D04: Refactored AI integration to use OpenAI client with base_url="https://api.groq.com/openai/v1", MODEL_NAME=llama-3.3-70b-versatile, and exponential backoff retry for 429 rate limits.
- D05: Implemented the Travelling Product keyframe path using scroll-bound interpolation (x, y % of viewport, rotation, scale, opacity) with automatic visibility culling and prefers-reduced-motion gating.
- D06: Implemented the self-drawing SVG demonstration with getTotalLength(), strokeDashoffset 2s transition, aria-pressed variant picker, and center-outward spread wordmark.
- D07: Restored full Clause Court application architecture (Document Selector, circular Risk Meter gauge, Key Concerns with verbatim evidence quotes, live streaming Moot Court Chamber, What-If scenario simulator, and Lawyer Brief export) styled in warm archival stationery.
- D08: Configured custom model GPT-OSS 120B (openai/gpt-oss-120b) with Groq API endpoint (https://api.groq.com/openai/v1) and active credentials, enabling live contract audits and interactive Moot Court sparring.
- D09: Hardened LLM API routing with layered failover (Groq API -> Gemini Flash -> Heuristic / Precomputed Grounding Engine) to prevent 404 model_not_found or 429 quota exhaustion errors from breaking UI or analysis flows.
- D10: Upgraded Gemini model from deprecated gemini-2.5-flash to gemini-3.8-flash per Gemini SDK instructions and disabled unauthenticated Groq model calls when API keys are not supplied.
