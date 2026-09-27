# AI Career Assistant
 
Upload a CV (PDF) and paste a job description, and get back a structured fit report:
matched requirements, missing requirements, seniority alignment, a short fit summary,
and a suitability score (1-10) with the reasoning behind it.
 
## Requirements
 
- Node.js 20+
- A [Groq](https://console.groq.com) API key

## Setup
 
```bash
npm install
```
 
This also builds the `shared` package automatically (via `postinstall`), which the
backend depends on.
 
Then create your backend env file:
 
```bash
cp backend/.env.example backend/.env
```
 
Edit `backend/.env` and add your Groq API key:
 
```
PORT=4000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
 
## Running it
 
In two separate terminals:
 
```bash
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:5173
```
 
The frontend dev server proxies `/api/*` requests to the backend, so just open
`http://localhost:5173` and use the app from there.
 
## Running tests
 
```bash
npm run test:backend
```
 
## Notes
 
- CV upload only supports PDF, capped at 5MB.
- The job description is pasted as free text (no file upload or link-fetching).
- `GROQ_MODEL` can be changed to any Groq-hosted chat model.
- AI calls go through a small provider-agnostic interface (`AiProvider`), so swapping
  Groq for another provider (e.g. Claude, OpenAI) is a matter of writing one new class,
  not changing how the rest of the app calls it.