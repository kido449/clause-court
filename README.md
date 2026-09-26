# Clause Court ⚖️

**Clause Court** is a contract "sparring partner" for non-lawyers. Non-lawyers frequently sign residential lease agreements without understanding hidden liability traps, unilateral renewal clauses, or ambiguous remedies. Clause Court provides document-grounded contract risk analysis, simulated moot court arguments between tenant and landlord advocates, what-if scenario testing, and lawyer brief generation.

> **Disclaimer:** Information only, not legal advice.

---

## 🚀 Key Features

1. **Document-Grounded Risk Scanner & Legal Linter:**
   - Evaluates clauses and calculates an overall **Total Risk Score** (0–100) with a visual gauge and 4 pillar subscores (Financial Exposure, Liability & Indemnity, Termination Traps, and Ambiguity/Compliance).
   - Lists prioritized **Key Concerns** with verbatim source quotes, risk impacts, and actionable counter-proposals.
   - Enforces deterministic cross-clause linting (contradictions, dangling references, undefined terms, and hidden renewal traps).
2. **Moot Court Sparring:**
   - Real-time streaming debate between two AI advocates (Tenant Advocate vs. Landlord Advocate) followed by a neutral judge verdict with confidence level.
3. **What-If Scenario Simulator:**
   - Evaluates real-world situations (e.g., *"I leave after 4 months"*, *"Can the landlord keep my deposit?"*) with cited contractual evidence and explicit lists of unknowns.
4. **Lawyer Brief Exporter:**
   - Generates a concise, structured Markdown brief ready to print or share with legal counsel, including top issues, contested clauses, and 8 targeted questions.

---

## 🤖 AI Model Configuration: Free Groq API

Clause Court is powered by the **free Groq API** running `llama-3.3-70b-versatile`:
- Standard `OpenAI` client configured with `base_url="https://api.groq.com/openai/v1"`
- Fast inference speed (~500+ tokens/sec)
- Automatic exponential backoff and retry handling for HTTP 429 rate limits
- Built-in `MOCK_MODE` for running 100% offline without network or API keys

---

## 🛠️ Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
# Groq API Configuration
GROQ_API_KEY="gsk_your-groq-api-key"
MODEL_NAME="llama-3.3-70b-versatile"

# Mock Mode (set to "false" to use live Groq API, or "true" for zero-key offline demo)
MOCK_MODE="false"
```

---

## 💻 Local Setup & Run Commands

### 1. Frontend & Single-Origin Preview
Run the web application:

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

The app will be available at `http://localhost:3000`.

### 2. Standalone Python Backend (FastAPI)
Run the Python FastAPI backend:

```bash
# Install Python dependencies
pip install fastapi uvicorn openai sse-starlette pypdf

# Launch FastAPI server on port 8000
uvicorn backend.app.main:app --port 8000 --reload
```

---

## ⏱️ 2-Minute Demo Script

1. **0:00 – 0:30 | Scanning the Agreement & Total Risk Score:**
   - Select the pre-loaded **"Commercial Office Lease"** or **"Residential Rental Agreement"** from the top selector.
   - Point out the **Total Risk Score Gauge** showing a **Critical / High Risk** rating, and the four pillar subscores.
   - Show the executive summary highlighting key traps (e.g. unilateral lockout, uncapped indemnification, automatic multi-year renewal).

2. **0:30 – 1:00 | Inspecting Key Concerns & Verbatim Evidence:**
   - In the **Key Concerns** list, expand **"KC-1: Uncapped Indemnity for Landlord Negligence"**.
   - Note the **Exact Contract Quote** copied verbatim from the document text and the "AI Hazard Analysis".
   - Click the clause reference to jump straight to the clause highlighted in the contract text.
   - Show the one-click **"Copy Counter-Proposal"** button for negotiating revised phrasing.

3. **1:00 – 1:30 | Moot Court Live Sparring:**
   - Select a contested clause (e.g. **Clause C4: Maintenance & Indemnity**).
   - Launch the Moot Court: watch the **Tenant Advocate** argue that the clause imposes disproportionate burdens without reciprocal duty.
   - Watch the **Landlord Advocate** rebut with standard commercial lease arguments.
   - Observe the **Neutral Judge** deliver a verdict (Contested / Ambiguous) with confidence ratings and recommendations.

4. **1:30 – 2:00 | What-If Simulation & Legal Brief Export:**
   - Type or select a scenario in the What-If tester: *"What if I terminate my lease early after 4 months?"*
   - Review the step-by-step contractual outcome citing evidence, and note the explicit list of *"What the contract does NOT say"*.
   - Click **"Export Brief"** to preview and download the one-page Markdown summary with 8 specific questions to ask an attorney.
