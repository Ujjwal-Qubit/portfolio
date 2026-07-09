import type { Project } from "./types";

// Source of truth: Content Dossier (B2). Order is fixed — this is the
// homepage project order as confirmed in the Dossier.
export const projects: Project[] = [
  {
    kind: "project",
    slug: "auradesign",
    title: "AuraDesign.AI",
    cardLine: "Sees what your users actually see — then writes the fix.",
    subtitle:
      "A senior UX consultant who lives in your browser, watches where your users' eyes actually go, and hands back the exact fixes — already written in code.",
    constellation: "builder",
    context:
      "Businesses lose potential customers not because the product is bad but because the website UI/UX fails in the first few seconds — users miss key info, get confused by layouts, and abandon, driving high bounce rates, low engagement, and poor conversions. Traditional analytics track clicks/scrolls but don't explain what users actually notice or ignore, or why they leave.",
    problem:
      "Teams guess where user attention actually goes. Traditional analytics track clicks and scrolls but don't explain what users notice, ignore, or why they leave.",
    solution:
      "Scrapes any site via Playwright and audits the UI against design-psychology + accessibility (WCAG) rules; tracks real eye-gaze in-browser with WebGazer.js (privacy-first — stores only (x,y) gaze coordinates + timestamps, no video) to generate attention heatmaps (hotspots vs dead zones); benchmarks against industry standards via Gemini; outputs a UX score and an impact-ranked fix list where each change is approvable in one click, opening a context-aware Gemini chat that returns ready-to-code CSS/Tailwind fixes.",
    roleScope:
      'Team of 3 ("The ACE"). I originated the concept and owned product design, the backend, all API integrations, and Vercel deployment. A teammate built the frontend/landing page.',
    stack: [
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "Heatmap.js",
      "Node.js",
      "Python",
      "Playwright",
      "WebGazer.js",
      "Gemini API",
      "PostgreSQL (Supabase/Neon)",
      "Vercel",
    ],
    // No outcome and no recognition: this project has no award or placement.
    // Do not add one — the Outcome section is omitted entirely when absent.
    links: [
      { label: "Live demo", href: "https://aura-design-ai-sand.vercel.app/" },
      { label: "GitHub", href: "https://github.com/Ujjwal-Qubit/AuraDesign.AI" },
    ],
    media: [
      // TODO(content): drop the real logo file in public/media/auradesign/logo.png
      { kind: "logo", src: "/media/auradesign/logo.png", alt: "AuraDesign.AI logo" },
      // TODO(content): drop the real landing-page screenshot in public/media/auradesign/landing.png
      {
        kind: "screenshot",
        src: "/media/auradesign/landing.png",
        alt: "AuraDesign.AI landing page",
      },
    ],
  },
  {
    kind: "project",
    slug: "coner-ai",
    title: "ConerAI",
    cardLine: "One script line turns any site into a multilingual acquisition agent.",
    subtitle:
      "A 24/7 acquisition agent in a single script — it speaks your visitor's language out loud, separates browsers from buyers, and syncs the winners to your CRM.",
    constellation: "builder",
    context:
      "Small teams, founders, and agencies lose leads because adding a capable chatbot normally means writing code, wiring up a CRM, and juggling analytics across disconnected tools. ConerAI collapses that into a one-line install — a voice-enabled, multilingual AI agent that greets visitors in their own language, qualifies the high-intent ones around the clock, and syncs them straight to the CRM. One acquisition layer instead of a stack of tools.",
    problem:
      "Adding a capable chatbot to a site normally needs coding and is English-centric, and acquisition tooling is scattered — reporting eats hours and it's hard to see what's actually converting.",
    solution:
      "Paste one line of script and any site gains a voice-enabled, multilingual AI agent that replies in the visitor's own language, runs in two modes (Acquisition & Customer Service), qualifies high-intent visitors 24/7, tracks them in a lead CRM, and surfaces an insights dashboard — zero code on the user's side, powered by Emergent's Universal LLM API.",
    roleScope:
      "Duo (2-person team); I was the main developer, building across every layer during the 40 hours at VibeCon 2026, IIT Delhi. My teammate built the landing page.",
    stack: [
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Emergent Universal API (LLM)",
      "Vercel",
    ],
    outcome:
      "Designed, built, and shipped end-to-end in 40 hours as a duo at VibeCon 2026, IIT Delhi.",
    links: [
      // TODO(content): Dossier marks the live URL as "TODO (coming later)"
      { label: "Live URL", note: "TODO (coming later)" },
      // TODO(content): Dossier marks the GitHub link as "TODO"
      { label: "GitHub", note: "TODO" },
    ],
    media: [
      // TODO(content): drop the real logo file in public/media/coner-ai/logo.png
      { kind: "logo", src: "/media/coner-ai/logo.png", alt: "ConerAI logo" },
      // TODO(content): drop the real landing-page screenshot in public/media/coner-ai/landing.png
      { kind: "screenshot", src: "/media/coner-ai/landing.png", alt: "ConerAI landing page" },
    ],
  },
  {
    kind: "project",
    slug: "patientid",
    title: "PatientID+",
    cardLine: "Recognises returning patients on sight. Records retrieved instantly.",
    subtitle:
      "Knows every returning patient by face — instant ID, instant records, zero re-registration.",
    constellation: "builder",
    context:
      "Every hospital visit meant re-registering the patient and re-entering their details by hand — even for returning patients — while each patient's treatment history stayed scattered and slow to retrieve. PatientID+ was built to end that repetition: recognise a returning patient on sight and surface their full record instantly. DXP handed me the brief during my first summer internship — the summer after my first year of engineering — a deliberately challenging problem they trusted me to own end-to-end.",
    problem:
      "Manual, paper-based patient identification is slow and error-prone — returning patients are re-registered from scratch every visit, and their history is hard to pull up exactly when it's needed.",
    solution:
      "A full-stack system that identifies patients in real time from a live camera feed using OpenCV facial recognition, then instantly retrieves the matching record — spanning the MongoDB data model and REST API through to the React front end.",
    roleScope: "Solo — sole developer, end-to-end across the full stack, during the DXP internship.",
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Python", "OpenCV", "REST API"],
    outcome:
      "Delivered and presented to DXP mentors, and integrated and tested against live security-camera feeds at DXP — the only intern-level project to ship as a standalone, production-ready system, recognised formally by mentors for its quality and completeness.",
    recognition: "Formal mentor recognition, DXP Software",
    links: [{ label: "Client project", private: true, note: "Private (client work)" }],
    // Dossier: "Media: Private (client work — none shareable)." — confirmed no media, not a TODO.
    media: [],
  },
  {
    kind: "project",
    slug: "edith",
    title: "E.D.I.T.H.",
    cardLine: "One workspace for studying — notes that talk back, tasks, timers.",
    subtitle:
      "The all-in-one study buddy: chats with your notes, remembers your files, and runs your to-do list and timers.",
    constellation: "builder",
    context:
      "E.D.I.T.H. — Education Dynamic Intelligent Task Handler — is a single workspace built to remove the constant tool-switching students face while studying: AI document chat, document storage, to-do lists, timers, and productivity tracking all in one place instead of scattered across apps. It was built as a Semester-3 project for the IT Solutions subject.",
    problem:
      "Studying means constantly switching between apps — a chatbot in one tab, notes in another, a to-do list somewhere else — which scatters focus and wastes time.",
    solution:
      "One workspace that holds everything a student needs while studying: Gemini-powered chat over documents you upload and store, Tesseract OCR to read scanned files and images, plus to-do lists, a Pomodoro timer, productivity tracking, and a password-protected document vault — no bouncing between tools.",
    roleScope: "Solo — full-stack, React front end + FastAPI/Python backend.",
    stack: ["React.js", "FastAPI", "Python", "Gemini API", "Tesseract OCR", "Vercel", "Render"],
    outcome:
      "Shipped as a complete, working product for the Semester-3 IT Solutions subject — not a demo of one feature, but the full integrated suite: document chat with OCR, storage vault, tasks, Pomodoro, and productivity tracking, built end-to-end solo across a React front end and FastAPI backend, and deployed live. (No formal grade or recognition attached.)",
    links: [
      {
        label: "Live demo",
        href: "https://e-d-i-t-h-education-dynamic-intelli.vercel.app/login",
      },
      {
        label: "GitHub",
        href: "https://github.com/Ujjwal-Qubit/E.D.I.T.H.---Education-Dynamic-Intelligent-Task-Handler",
      },
    ],
    // TODO(content): Dossier's Media section for this entry was blank — add real image(s) if any exist.
    media: [],
  },
  {
    kind: "project",
    slug: "edc-registration",
    title: "EDC Event Portal",
    cardLine: "The platform EDC events run on, registration to results.",
    subtitle:
      "The command centre EDC events run on — sign-ups, submissions, shortlisting, and results, all under one login.",
    constellation: "builder",
    context:
      "Before this existed, EDC ran events on a patchwork of Google Forms — registrations and PPT submissions collected by hand, each presentation then scored externally one by one, and results emailed back manually. The EDC Event Portal replaces all of that: participants and team leaders create accounts, form teams, register, and submit, while organisers manage shortlisting, communication, and results from one system.",
    problem:
      "EDC ran events on scattered Google Forms — manual registration and PPT collection, presentations scored externally one by one, and results emailed back by hand.",
    solution:
      "An end-to-end event portal where participants and team leaders create accounts, join teams, register, and submit PPTs, while organisers handle shortlisting, task assignment, email communication, and live updates during the event — all in one place.",
    roleScope:
      "Team project, built while I was a member (before my Technical Lead role). I owned and built the complete backend end-to-end.",
    stack: ["Node.js", "Express 5", "Prisma", "PostgreSQL", "Render"],
    outcome:
      "Ran in production at its first event, Founders' Pit 2026 — 130+ registrations across 45 teams, with PPT submissions processed smoothly and no issues.",
    recognition: "Recognised by university higher authorities — the Vice Chancellor and faculty coordinators.",
    links: [{ label: "Event portal", private: true, note: "Private to the society" }],
    // TODO(content): Dossier's Media section for this entry was blank — add real image(s) if any exist.
    media: [],
  },
  {
    kind: "project",
    slug: "edc-auction",
    title: "EDC Auction System",
    cardLine: "A live bidding room where teams buy their problem.",
    subtitle:
      "A live auction room where team leaders bid against each other for the problem their team will battle all day.",
    constellation: "builder",
    context:
      "Founders' Pit is an EDC event where teams register and submit a PPT proposing a business solution to one of the problem statements set by the Entrepreneurship Development Cell. Shortlisted teams then compete on event day, which opens with a live auction: teams bid for the problem statement they want to solve — easier problems carry a higher base price, harder ones a lower base price — and then spend the full day solving it through a set of tasks. Judging weighs multiple criteria, including how much a team spent at the auction.",
    problem:
      "The society needed to run the event's opening auction live — letting shortlisted teams bid, in the room, for the problem statement they wanted to take on.",
    solution:
      "A live-bidding auction module integrated into the EDC Event Portal, where each team leader joins the bidding room and places bids on problem statements on behalf of their team, with the system tracking every bid and each team's spend. Live bidding ran on optimised REST/CRUD APIs with database-managed state (not WebSockets), tuned for near-real-time responsiveness.",
    roleScope: "Team project, built while I was a member. I owned and built the complete backend end-to-end.",
    stack: ["Node.js", "Prisma", "PostgreSQL"],
    outcome:
      "Ran live at Founders' Pit 2026 with 30 teams — team leaders bidding on behalf of their teams — and worked flawlessly.",
    recognition: "Recognised by faculty coordinators.",
    links: [{ label: "Auction system", private: true, note: "Private to the society" }],
    // TODO(content): Dossier's Media section for this entry was blank — add real image(s) if any exist.
    media: [],
  },
];
