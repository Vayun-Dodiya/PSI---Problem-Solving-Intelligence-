<div align="center">

# 🧠 PSI — Problem Solving Intelligence

**An AI-powered platform that doesn't just answer problems — it teaches you how to solve them.**

PSI analyzes a user's attempted solution, identifies *why* it went wrong, uncovers misunderstood concepts, and guides the user toward a corrected, well-reasoned answer.

![Status](https://img.shields.io/badge/status-active%20development-F2C94C?style=flat-square)
![Backend](https://img.shields.io/badge/backend-FastAPI-0B9E7E?style=flat-square&logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-6C5CE7?style=flat-square)

**[View Repository →](https://github.com/Vayun-Dodiya/PSI---Problem-Solving-Intelligence-)**

[Overview](#overview) •
[Features](#current-feature--ai-code-analyzer) •
[Getting Started](#getting-started) •
[API Reference](#api-reference) •
[Roadmap](#roadmap) •
[Contributing](#contributing)

</div>

---

## 📖 Overview

Most AI assistants are built to **answer questions**. PSI is built to **help you solve problems**.

Instead of just returning a correct solution, PSI analyzes your attempt, finds the flaw in your reasoning, and explains it — turning mistakes into learning opportunities.

```text
Traditional tools:  Problem → Answer
PSI:                Problem → Understand → Diagnose → Explain → Guide → Correct → Learn
```

### The Problem PSI Solves

Getting a correct answer doesn't teach you why *your* answer was wrong. PSI is designed to answer the questions that actually matter for learning:

- What was the user trying to do?
- What approach did they take, and where did it break down?
- Why is that approach incorrect?
- What underlying concept was misunderstood?
- Can a hint guide the user to the fix before revealing the full solution?
- How confident is the system in its own analysis?

> **PSI is not built to simply tell you the answer. It is built to help you understand how to reach it.**

### 👋 New here and want to contribute?

PSI is early-stage, which means there's a lot of open ground — from small fixes to entire roadmap phases (frontend, personalization, new analysis modes). Jump straight to **[Contributing](#contributing)** for setup, workflow, and a list of beginner-friendly tasks. No contribution is too small to be useful.

---

## 🚧 Project Status

**Current stage:** Backend MVP — AI Code Analyzer

| Component | Status |
|---|---|
| FastAPI backend | ✅ Implemented |
| Gemini AI integration | ✅ Implemented |
| Code Analyzer mode | ✅ Implemented |
| Structured JSON responses | ✅ Implemented |
| Frontend UI | 🚧 Scaffolded, in progress |
| Personalization / profiles | 📋 Planned |

Users can currently submit a programming problem, their attempted code, the language, and an analysis mode. The backend sends this to Gemini and returns a structured breakdown of intent, approach, mistakes, misunderstood concepts, hints, corrected code, and a confidence score.

The `frontend/` directory exists to establish the project's architecture but is not yet functional.

---

## 🧠 Current Feature — AI Code Analyzer

The Code Analyzer takes a user's attempted solution and returns a structured diagnostic report:

| Field | What it does |
|---|---|
| **Intent** | Infers what the user was trying to accomplish |
| **Approach Summary** | Summarizes the strategy the user took |
| **Mistake Identification** | Pinpoints the primary error |
| **Why Incorrect** | Explains *why* the approach/implementation fails |
| **Misunderstood Concepts** | Lists the underlying concepts that seem misunderstood |
| **Hint** | Nudges the user toward the fix without giving it away |
| **Corrected Code** | Provides corrected code when the analyzer determines a correction is appropriate |
| **Confidence** | A score reflecting the model's confidence in the analysis |

### Example

**Input**
```json
{
  "prompt": "Write a function to find the largest element in an array.",
  "code": "def largest(arr):\n    max = 0\n    for i in arr:\n        if i < max:\n            max = i\n    return max",
  "language": "python",
  "mode": "code_analyzer"
}
```

**Analysis produced**
```text
Intent      → Find the maximum value in the array.
Approach    → Iterate through the array, tracking a running maximum.
Mistake     → The comparison uses '<' instead of '>'.
Why Wrong   → The value updates on smaller elements instead of larger ones.
Concept     → Comparison logic for tracking a maximum value.
Hint        → What should be true about an element for it to replace the
              current maximum?
```

The full response is returned as structured JSON per the [API schema](#api-reference) below.

> [!NOTE]
> Only the **Code Analyzer** mode above is implemented today. Everything under [Long-Term Vision](#long-term-vision) describes where PSI is headed, not what it currently does.

---

## 🏗️ Architecture

```text
Client
   │
   ▼
FastAPI Routes
   │
   ▼
Request Validation (Pydantic Schemas)
   │
   ▼
Services (AI / Code Analysis)
   │
   ▼
Gemini AI
   │
   ▼
Structured JSON Response
```

This separation of routes, schemas, services, and prompts means each layer — AI logic, API surface, database, frontend, and prompt engineering — can evolve independently.

### Prompt Architecture

AI instructions live outside application code, in `backend/prompts/`:

```text
backend/prompts/
├── reasoning_analysis.txt
├── hint_generation.txt
└── misconception_detection.txt
```

This lets prompt behavior be iterated on without touching core logic.

### 🧭 How the codebase fits together (for contributors)

If you're new to the code, here's the mental model:

- **`routes/`** — defines API endpoints and connects incoming requests to the appropriate services. Thin layer; no business logic here.
- **`schemas/`** — Pydantic models that define and validate request/response contracts. Change these when the API shape changes.
- **`services/`** — where the actual work happens: calling Gemini, parsing its output, applying analysis logic. Most feature work lands here.
- **`prompts/`** — plain-text prompt templates fed to Gemini. You can often improve analysis quality just by editing these, no Python required.
- **`database/`** — database configuration and models; currently minimal and intended for future personalization features (Phase 4).
- **`tests/`** — mirrors the structure above; add a test alongside whatever you change.

**Rule of thumb:** if you're changing *what* PSI returns → edit a schema. If you're changing *how* PSI analyzes → edit a service or prompt. If you're adding a new endpoint → start in `routes/`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **AI** | Google Gemini API, Google GenAI Python SDK *(exact model set in `backend/services/ai_service.py`)* |
| **Supporting** | python-dotenv, HTTPX |
| **Frontend** *(planned)* | HTML, CSS, JavaScript |

---

## 📁 Project Structure

```text
PSI---Problem-Solving-Intelligence/
│
├── frontend/                  # UI (scaffolded, WIP)
│   ├── index.html
│   ├── analyze.html
│   ├── profile.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── routes/                 # API route definitions
│   ├── services/                # AI + code analysis logic
│   ├── schemas/                 # Pydantic request/response models
│   ├── database/                 # DB config & models
│   └── prompts/                  # AI prompt templates
│
├── tests/                      # Backend test structure
├── .env.example
├── requirements.txt
└── README.md
```

| Directory | Purpose |
|---|---|
| `frontend/` | Client-facing UI |
| `backend/` | FastAPI application |
| `routes/` | API endpoint definitions |
| `services/` | Core AI/analysis logic |
| `schemas/` | Request/response validation models |
| `database/` | DB configuration and models |
| `prompts/` | AI prompt templates |
| `tests/` | Automated backend tests |

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.10+
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Vayun-Dodiya/PSI---Problem-Solving-Intelligence-.git
cd PSI---Problem-Solving-Intelligence-
```

### 2. Create and activate a virtual environment

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

Key dependencies: `fastapi`, `uvicorn`, `google-genai`, `python-dotenv`, `pydantic`, `httpx`

### 4. Configure environment variables

Copy the example file and add your key:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_api_key_here
```

> [!WARNING]
> Never commit your real `.env` file. Confirm it's listed in `.gitignore` before pushing.

### 5. Run the backend

```bash
uvicorn backend.main:app --reload
```

Interactive API docs will be available at:

- Swagger UI → `/docs`
- ReDoc → `/redoc`

---

## 🔌 API Reference

### `POST /api/analyze`

Analyzes a user's submitted code using the Code Analyzer mode.

**Request body**

```json
{
  "prompt": "string",
  "code": "string",
  "language": "string",
  "mode": "code_analyzer"
}
```

| Field | Type | Description |
|---|---|---|
| `prompt` | string | The problem statement or context |
| `code` | string | The user's attempted solution |
| `language` | string | Programming language of the code |
| `mode` | string | Requested analysis mode |

**Response body**

```json
{
  "success": true,
  "mode": "code_analyzer",
  "response": {
    "intent": "string",
    "approach_summary": "string",
    "mistake_identified": "string",
    "why_incorrect": "string",
    "misunderstood_concepts": ["string"],
    "hint": "string",
    "correct_code_provided": true,
    "corrected_code": "string",
    "confidence": 1
  },
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

| Field | Description |
|---|---|
| `success` | Whether the request was processed successfully |
| `mode` | The analysis mode used |
| `response.intent` | Detected intent behind the submission |
| `response.approach_summary` | Summary of the user's approach |
| `response.mistake_identified` | The primary mistake found |
| `response.why_incorrect` | Why the approach/code fails |
| `response.misunderstood_concepts` | Concepts that appear misunderstood |
| `response.hint` | Guidance toward the fix |
| `response.correct_code_provided` | Whether a correction was included |
| `response.corrected_code` | The corrected code, if provided |
| `response.confidence` | Model confidence in the analysis |
| `error` | Populated only when `success` is `false`; `null`/omitted on a successful request |

**Status codes**

| Code | Meaning |
|---|---|
| `200` | Analysis completed successfully |
| `4xx` | Invalid request (e.g. missing fields) |
| `5xx` | Server, backend, or AI-provider failure |

*(Document only the codes your implementation actually returns.)*

### Try it without a frontend

Since the UI isn't built yet, the fastest way to try PSI is through the auto-generated docs or `curl`:

**Swagger UI**
1. Start the backend: `uvicorn backend.main:app --reload`
2. Open `/docs` in your browser
3. Expand `POST /api/analyze` → **Try it out**
4. Paste a request body → **Execute**

**curl**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a function to find the largest element in an array.",
    "code": "def largest(arr):\n    max = 0\n    for i in arr:\n        if i < max:\n            max = i\n    return max",
    "language": "python",
    "mode": "code_analyzer"
  }'
```

---

## 🧪 Testing

```text
tests/
├── test_api.py             # API-level behavior
├── test_ai.py               # AI service behavior
└── test_code_analyzer.py    # Code analyzer logic
```

Run the suite with:

```bash
pytest
```

Test coverage will grow alongside new PSI capabilities.

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅
- [x] FastAPI backend
- [x] Gemini API integration
- [x] Pydantic validation
- [x] Code Analyzer
- [x] Structured AI responses
- [x] Prompt-based architecture
- [x] Backend test structure

### Phase 2 — Frontend 🚧
- [ ] Landing page
- [ ] Code analysis interface
- [ ] Code editor / input UI
- [ ] Analysis result UI
- [ ] Hint & corrected-code presentation
- [ ] Profile interface

### Phase 3 — PSI Intelligence 📋
- [ ] Deeper problem understanding & classification
- [ ] Goal/constraint extraction
- [ ] Problem decomposition
- [ ] Multiple solution approaches + comparison
- [ ] Solution recommendation & action-plan generation
- [ ] Feedback and refinement loop

### Phase 4 — Personalization 📋
- [ ] User profiles & learning history
- [ ] Mistake tracking
- [ ] Concept weakness detection
- [ ] Personalized recommendations & progress tracking

### Phase 5 — Expansion 📋
- [ ] Additional languages & problem-solving modes
- [ ] Advanced code analysis
- [ ] Production deployment & performance optimization

---

## ⚠️ Current Limitations

PSI is an early MVP. To set expectations accurately:

- Only the **Code Analyzer** mode is implemented — the broader problem-solving pipeline described below is not yet built.
- The **frontend is not functional yet**; interact with the API directly via `/docs` or `curl` for now.
- AI-generated analysis can be imperfect — treat mistakes, hints, and corrections as guidance, not ground truth.
- Analysis quality depends on the clarity of the submitted problem, code, and context.

---

## 🔮 Long-Term Vision

PSI's ultimate goal is to generalize beyond code review into a broader problem-solving engine:

```text
USER PROBLEM → UNDERSTAND → CLASSIFY → EXTRACT GOALS & CONSTRAINTS
    → DECOMPOSE → GENERATE SOLUTIONS → EVALUATE → RECOMMEND
    → CREATE ACTION PLAN → FEEDBACK & REFINEMENT
```

The Code Analyzer is the first real-world implementation of this pipeline.

---

## 📌 Design Philosophy

1. **Understand before solving** — grasp user intent first.
2. **Explain, don't just correct** — understanding beats a bare answer.
3. **Focus on reasoning** — analyze approach, not just syntax.
4. **Identify misconceptions** — repeated mistakes trace back to gaps in understanding.
5. **Guide before revealing** — hints before full solutions.
6. **Turn analysis into action** — help users decide what to do next.

---

## 🤝 Contributing

PSI is early-stage and actively evolving — contributions are welcome, **even if you're new to Git or GitHub.**

> [!TIP]
> **You do not need to touch the main codebase directly.** Code and documentation changes go through a Pull Request and are reviewed before they're merged. Your changes cannot affect the `main` branch unless a Pull Request is reviewed and merged by a maintainer — so you can experiment safely in your own fork or branch.

### Ways to contribute

- 🐛 **Report bugs** — open an issue describing what happened, what you expected, and steps to reproduce.
- 💡 **Suggest features** — open an issue tagged `enhancement` describing the idea and its motivation.
- 📝 **Improve docs** — clarify the README, add code comments, write examples.
- 🧑‍💻 **Write code** — pick up an open issue or a roadmap item and submit a PR.
- 🧪 **Add tests** — help expand coverage in `tests/`.
- 🎨 **Suggest UX/UI ideas** — propose improvements to how the analysis results are presented.
- 🧠 **Improve AI prompts** — refine wording in `backend/prompts/` for better analysis quality.

> [!NOTE]
> **Every contribution does not have to be code.** Documentation, testing, bug reports, UI ideas, prompt improvements, and constructive feedback all move PSI forward just as much as a pull request does.

### 🌱 New to GitHub? Start here

You don't need to know Git to make your first contribution — documentation, bug reports, testing, UX suggestions, and other contributions can be made directly through GitHub. Beginner-friendly options include:

| Contribution | Where to start |
|---|---|
| Fix a typo or grammar issue | Use GitHub's **Edit** (✏️) button directly on the file |
| Improve the README | Same — edit in-browser, no local setup needed |
| Report a bug | Open a [GitHub Issue](https://github.com/Vayun-Dodiya/PSI---Problem-Solving-Intelligence-/issues) with steps to reproduce |
| Suggest a feature or UX idea | Open an issue tagged `enhancement` |
| Test the API and report issues | Hit `/docs`, try edge cases, open an issue for anything odd |

For documentation-only edits, click **Edit** on the file in GitHub, make your change, and submit it — GitHub automatically opens a Pull Request from your edit. It is never applied directly to the main project without review.

### Where should I start (as a developer)?

| If you're... | Try this |
|---|---|
| **Comfortable with Python, new to AI/LLM work** | Improve a prompt template in `backend/prompts/` — no model-calling code needed |
| **Backend-focused** | Pick up a `services/` or `schemas/` item from the [Roadmap](#roadmap), e.g. Phase 3 problem classification |
| **Frontend-focused** | Start building out `frontend/` per Phase 2 — landing page, analysis UI, etc. |
| **Into testing/QA** | Add missing cases to `tests/test_api.py`, `test_ai.py`, or `test_code_analyzer.py` |

Issues may be labeled **`good first issue`**, **`help wanted`**, **`documentation`**, **`enhancement`**, or **`bug`** — check the [Issues tab](https://github.com/Vayun-Dodiya/PSI---Problem-Solving-Intelligence-/issues) for something pre-scoped, or open a new one to propose an idea.

### 🧑‍💻 Code contribution workflow

```text
PSI Repository
      │
      ▼
   Fork it
      │
      ▼
Your own GitHub Repository
      │
      ▼
Create a Branch
      │
      ▼
Make your Changes
      │
      ▼
Test your Changes
      │
      ▼
Push your Branch
      │
      ▼
Create a Pull Request
      │
      ▼
PSI Maintainer Reviews Changes
      │
      ├── Changes Requested ──► Contributor Updates PR
      │
      └── Approved ──► Merge into Main
```

If you're unsure what to work on or how to implement an idea, open an Issue first and discuss it before changing the code.

**1. Fork the repository**

Click **Fork** at the top of the PSI GitHub repository. This creates your own copy under your account — you can experiment freely without affecting the original project.

**2. Clone your fork**

```bash
git clone https://github.com/<your-username>/PSI---Problem-Solving-Intelligence-.git
cd PSI---Problem-Solving-Intelligence-
```

**3. Create a separate branch**

Never make changes directly on `main`. Branch first:

```bash
git checkout -b feature/your-change
```

Naming examples:

```bash
git checkout -b feature/improve-code-analyzer
git checkout -b fix/api-validation
git checkout -b docs/improve-readme
```

**4. Make your changes**

Work inside your branch, and keep the scope tight — one concern per PR:

```text
✅ Good:       Improve error handling in /api/analyze
⚠️ Less ideal: Change API + redesign frontend + modify prompts + restructure database
```

Focused changes are dramatically easier — and faster — to review.

**5. Test your changes**

```bash
pytest
```

If you're touching the API, AI services, or prompts, include relevant test cases wherever possible.

**6. Commit your changes**

```bash
git add .
git commit -m "Improve code analyzer error handling"
```

Write a message that briefly explains *what* changed.

**7. Push your branch**

```bash
git push origin feature/your-change
```

**8. Open a Pull Request**

On your fork, select **Compare & pull request**, targeting `main` on the original PSI repository. In the description, answer:

- **What did you change?**
- **Why did you change it?**
- **How did you test it?**
- **Any limitations or things that should be reviewed?**

Example:

```text
### What changed?
Improved the Code Analyzer's handling of incomplete code submissions.

### Why?
The analyzer previously returned an unclear response when the
submitted code was empty or incomplete.

### Testing
Tested the API with valid, incomplete, and empty code submissions.

### Notes
No changes were made to the existing response schema.
```

### 🔍 Review before merge

Pull Requests are reviewed by the project maintainer before merging. Your PR may be:

- ✅ **Approved and merged**
- 🔄 **Returned with requested changes**
- 💬 **Discussed before merging**
- ❌ **Declined**, if it doesn't fit the project's current direction

> [!IMPORTANT]
> If changes are requested, just push additional commits to the **same branch** — GitHub updates the existing PR automatically. **You never need to open a new Pull Request for the same change.**

### Coding conventions

- Follow the existing `routes/` → `schemas/` → `services/` → `prompts/` separation — don't put business logic in route handlers.
- Use type hints and Pydantic models for any new request/response shapes.
- Keep prompt templates in `backend/prompts/` as plain text, not inline strings in Python.
- Match existing naming patterns (`snake_case` for functions/files; test filenames mirror the module under test).
- Write a docstring or short comment for any non-obvious function, especially in `services/`.

### ✅ Before opening a PR, check that you have:

- [ ] Run `pytest` locally and confirmed all tests pass
- [ ] Added or updated tests for your change
- [ ] Kept the PR scoped to one feature or fix
- [ ] Written a clear PR description (what, why, how tested)
- [ ] Not committed `.env`, API keys, or other secrets

> [!WARNING]
> **Never push directly to `main`.** All meaningful changes must go through a reviewed Pull Request. Also: never commit `.env` files or API keys, and don't remove or overwrite existing functionality without explaining why in the PR description.

### Ground rules

- Keep PRs focused — one feature or fix per PR is easier to review than a bundle of unrelated changes.
- If you're planning a larger change (a new analysis mode, a schema change), open an issue first to discuss the approach before investing significant time.
- Be respectful and constructive in issues, PRs, and reviews.

### 💡 Don't know what to work on?

Look for issues that may be labeled `good first issue`, `help wanted`, `documentation`, `enhancement`, or `bug` — or open an issue describing an idea or problem you noticed and discuss it before writing code. There's no such thing as too small a question when you're getting oriented in a new codebase.

> [!NOTE]
> Not a coder? You can still contribute by testing PSI, reporting bugs, suggesting UX improvements, improving AI prompts, or improving documentation.

---

## 🔒 Security

PSI uses environment variables for all sensitive configuration.

Before pushing changes, verify that:
- `.env` is listed in `.gitignore`
- No API keys appear in source code or commit history
- No sensitive configuration is committed to the repository

Recommended `.gitignore` entries:

```text
.env
__pycache__/
*.pyc
venv/
.venv/
```

> [!CAUTION]
> If an API key is ever exposed, **revoke and regenerate it immediately.**

---

## 📄 License

This project currently does not have a license. A license will be added in a future update — until then, no rights to reuse or redistribute the code are granted.

---

## 👨‍💻 Author

**Vayun Dodiya**
Creator of PSI — Problem Solving Intelligence

---

<div align="center">

**PSI is not built to simply tell you the answer. It is built to help you understand how to reach it.**

</div>