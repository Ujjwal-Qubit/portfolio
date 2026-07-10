import type { Project } from "./types";

// Source of truth: Site Copy (Final) doc.
// Order is fixed — this is the homepage project order as confirmed in the doc.
export const projects: Project[] = [
  {
    kind: "project",
    slug: "auradesign",
    title: "AuraDesign.AI",
    cardLine: "Sees what your users actually see — then writes the fix.",
    subtitle:
      "A senior UX consultant that lives in the browser — it watches where real attention goes and hands back the fixes, already written in code.",
    constellation: "builder",
    year: "2026",
    role: "Concept · Backend · AI",
    status: "Team of 3 · Live demo",
    context:
      "Most websites lose people in the first few seconds — not because the product behind them is weak, but because the interface quietly fails. Key information gets missed, layouts confuse, and visitors leave before they ever reach the thing that mattered. It drives high bounce rates, low engagement, and lost customers, and the frustrating part is that traditional analytics can't explain why: click and scroll data tells you what happened on a page, never what a user actually noticed, ignored, or gave up on. AuraDesign.AI started from that gap — the idea that a design should be able to tell you where it's failing before real users pay the price for it.",
    problem:
      "Teams are forced to guess where user attention actually goes. Analytics count clicks and scrolls, but they say nothing about what draws the eye, what gets skipped, or why someone bounces. So interface decisions come down to opinion and instinct — and the cost of getting them wrong only shows up later, in the numbers, when the users are already gone.",
    solution:
      "AuraDesign.AI acts as an automated UX critic for any live site. It scrapes the page with Playwright, then audits it against design-psychology principles and WCAG accessibility rules, while WebGazer.js tracks real in-browser eye-gaze — privacy-first, storing only anonymous gaze coordinates and timestamps, never video — to build attention heatmaps of genuine hotspots and dead zones. Gemini benchmarks the design against industry standards, and the tool returns a clear UX score alongside an impact-ranked list of fixes. Each fix is approvable in a single click that opens a context-aware chat and hands back ready-to-code CSS.",
    roleScope:
      'Team of 3 ("The ACE"). I originated the concept and owned product design, the backend, all API integrations, and Vercel deployment. A teammate built the frontend/landing page.',
    stack: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Heatmap.js",
      "Node.js",
      "Python",
      "Playwright",
      "WebGazer.js",
      "Gemini API",
      "PostgreSQL",
      "Vercel",
    ],
    // No outcome: this project has no award or placement.
    // Do not add one — the Outcome section is omitted entirely when absent.
    // cardStat is a capability descriptor for the homepage card only, not an outcome.
    cardStat:
      "AI UX auditor that scrapes websites, generates privacy-first eye-gaze heatmaps, benchmarks against WCAG and industry standards, and delivers one-click, ready-to-code UI fixes.",
    links: [
      { label: "Live demo", href: "https://aura-design-ai-sand.vercel.app/" },
      { label: "GitHub", href: "https://github.com/Ujjwal-Qubit/AuraDesign.AI" },
    ],
    media: [
      { src: "/media/auradesign/logo.png", alt: "AuraDesign.AI logo" },
      { src: "/media/auradesign/landing.png", alt: "AuraDesign.AI landing page" },
    ],
  },
  {
    kind: "project",
    slug: "coner-ai",
    title: "ConerAI",
    cardLine: "One script line turns any site into a multilingual acquisition agent.",
    subtitle:
      "A round-the-clock acquisition agent in a single line of script — it speaks your visitor's language out loud, separates browsers from buyers, and syncs the winners straight to your CRM.",
    constellation: "builder",
    year: "2026",
    role: "Duo · Lead developer",
    status: "Built at VibeCon 2026, IIT Delhi",
    context:
      "Small teams, founders, and agencies lose leads for a boring reason: adding a genuinely capable chatbot to a site normally means writing code, wiring up a CRM, and stitching analytics across a handful of disconnected tools. By the time all that is in place, the visitors it was meant to catch are long gone. ConerAI collapses the whole stack into a one-line install — a voice-enabled, multilingual AI agent that greets visitors in their own language, works the room around the clock, and turns a passive website into an active acquisition channel.",
    problem:
      "Adding a chatbot is a coding project, and most of them only speak English — a hard limit for anyone with a global audience. On top of that, acquisition tooling is scattered across separate apps: the chat lives in one place, the leads in another, the reporting somewhere else. Seeing what's actually converting takes hours no small team has.",
    solution:
      "Paste one line of script and any website gains a voice-enabled, multilingual AI agent that replies in each visitor's own language. It runs in two modes — Acquisition and Customer Service — qualifies high-intent visitors 24/7, tracks them in a built-in lead CRM, and surfaces everything through an insights dashboard, with zero code on the user's side. The language and reasoning are powered by Emergent's Universal LLM API, so one script replaces a whole acquisition stack.",
    roleScope:
      "Duo (2-person team); I was the main developer, building across every layer during the 40 hours at VibeCon 2026, IIT Delhi. My teammate built the landing page.",
    stack: ["React", "Node.js", "Express.js", "MongoDB", "Emergent Universal API (LLM)", "Vercel"],
    outcome:
      "Designed, built, and shipped end-to-end in 40 hours as a two-person team at VibeCon 2026, IIT Delhi.",
    links: [
      // TODO(content): ConerAI is "coming soon" per the Site Copy (Final) doc — not a real URL yet.
      { label: "Live", note: "Coming soon" },
      // TODO(content): ConerAI GitHub repo is "coming soon" per the Site Copy (Final) doc.
      { label: "GitHub", note: "Coming soon" },
    ],
    media: [
      { src: "/media/coner-ai/logo.png", alt: "ConerAI logo" },
      { src: "/media/coner-ai/landing.png", alt: "ConerAI landing page" },
    ],
  },
  {
    kind: "project",
    slug: "patientid",
    title: "PatientID+",
    cardLine: "Recognises returning patients on sight. Records retrieved instantly.",
    subtitle:
      "Knows every returning patient by face — instant identification, instant records, zero re-registration.",
    constellation: "builder",
    year: "2025",
    role: "Solo · Full-stack",
    status: "DXP Software · Production-ready",
    context:
      "Every hospital visit began the same way: re-registering the patient and re-entering their details by hand, even for people who had been there many times before — while each patient's treatment history stayed scattered and slow to pull up exactly when it was needed most. PatientID+ was built to end that repetition: recognise a returning patient on sight and surface their full record instantly. DXP handed me the brief during my first summer internship — the summer after my first year of engineering — as a deliberately challenging problem they trusted me to own from end to end.",
    problem:
      "Manual, paper-based patient identification is slow and error-prone. Returning patients are registered from scratch on every visit, and their history is hard to retrieve at the exact moment a clinician needs it — friction that adds up across hundreds of visits a day.",
    solution:
      "A full-stack system that identifies patients in real time from a live camera feed using OpenCV facial recognition, then instantly retrieves the matching record — spanning the MongoDB data model and REST API through to the React front end. A returning patient is recognised on sight, and their full history is on screen before the conversation even starts.",
    roleScope: "Solo — sole developer, end-to-end across the full stack, during the DXP internship.",
    stack: ["React", "Node.js", "Express.js", "MongoDB", "Python", "OpenCV", "REST API"],
    outcome:
      "Delivered and presented to DXP mentors, and integrated and tested against live security-camera feeds on site — the only intern-level project to ship as a standalone, production-ready system, recognised formally by mentors for its quality and completeness.",
    links: [{ label: "Client project", private: true, note: "Private (client work)" }],
    // Confirmed no media: private client work, none shareable.
    media: [],
  },
  {
    kind: "project",
    slug: "edith",
    title: "E.D.I.T.H.",
    cardLine: "One workspace for studying — notes that talk back, tasks, timers.",
    subtitle:
      "The all-in-one study workspace — it chats with your notes, remembers your files, and runs your to-do list and timers.",
    constellation: "builder",
    year: "2025",
    role: "Solo · Full-stack",
    status: "Semester-3 project · Live",
    context:
      "E.D.I.T.H. — Education Dynamic Intelligent Task Handler — is a single workspace built to remove the constant tool-switching students live with while they study. Instead of a chatbot in one tab, notes in another, and a to-do list in a third, everything a student needs sits in one place: AI document chat, file storage, tasks, timers, and productivity tracking. It was built end-to-end as a Semester-3 project for the IT Solutions subject.",
    problem:
      "Studying means constantly bouncing between apps — a chatbot here, notes there, a timer somewhere else — and every switch fractures focus and quietly eats time. Nothing talks to anything else, so the tools meant to help you concentrate become the thing breaking your concentration.",
    solution:
      "One workspace that holds everything studying actually needs: Gemini-powered chat over documents you upload and store, Tesseract OCR that reads scanned files and images so even handwritten or photographed notes are searchable, plus a to-do list, a Pomodoro timer, productivity tracking, and a password-protected document vault for anything sensitive. No bouncing between tools — the notes, the assistant, and the workflow live together.",
    roleScope: "Solo — full-stack, React front end + FastAPI/Python backend.",
    stack: ["React", "FastAPI", "Python", "Gemini API", "Tesseract OCR", "Vercel", "Render"],
    outcome:
      "Shipped as a complete, fully working suite — not a demo of one feature, but the whole integrated product, built end-to-end solo and deployed live.",
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
    media: [{ src: "/media/edith/screenshot.png", alt: "E.D.I.T.H. study workspace screenshot" }],
  },
  {
    kind: "project",
    slug: "edc-registration",
    title: "EDC Event Portal",
    cardLine: "The platform EDC events run on, registration to results.",
    subtitle:
      "The command centre EDC events run on — sign-ups, submissions, shortlisting, and results, all under one login.",
    constellation: "builder",
    year: "2026",
    role: "Backend · Team project",
    status: "In production",
    context:
      "Before this existed, EDC ran its events on a patchwork of Google Forms: registrations and PPT submissions collected by hand, each presentation scored externally one at a time, and results emailed back manually. It worked, barely, and it fell apart the moment an event grew. The EDC Event Portal replaces the entire patchwork — participants and team leaders create accounts, form teams, register, and submit, while organisers run shortlisting, communication, and results from a single system.",
    problem:
      "Running an event across scattered Google Forms means everything is manual: registrations and PPTs collected by hand, presentations scored externally one by one, results emailed back individually. It doesn't scale, it's error-prone, and it buries organisers in admin on the day they can least afford it.",
    solution:
      "An end-to-end event portal where participants and team leaders create accounts, join teams, register, and submit their PPTs, while organisers handle shortlisting, task assignment, email communication, and live updates during the event — all in one place. One login, one source of truth, from the first sign-up to the final result.",
    roleScope:
      "Team project, built while I was a member (before my Technical Lead role). I owned and built the complete backend end-to-end.",
    stack: ["Node.js", "Express 5", "Prisma", "PostgreSQL", "Render"],
    outcome:
      "Ran in production at its first event, Founders' Pit 2026 — 130+ registrations across 45 teams, with PPT submissions processed smoothly and no issues on the day. Recognised by university higher authorities, including the Vice Chancellor and faculty coordinators.",
    links: [{ label: "Event portal", private: true, note: "Private to the society" }],
    media: [
      { src: "/media/edc-registration/01.png", alt: "EDC Event Portal — registration screen" },
      { src: "/media/edc-registration/02.png", alt: "EDC Event Portal — organiser dashboard" },
    ],
  },
  {
    kind: "project",
    slug: "edc-auction",
    title: "EDC Auction System",
    cardLine: "A live bidding room where teams buy their problem.",
    subtitle:
      "A live auction room where team leaders bid against each other for the very problem their team will battle all day.",
    constellation: "builder",
    year: "2026",
    role: "Backend · Team project",
    status: "In production · Founders' Pit 2026",
    context:
      "Founders' Pit is an EDC event where teams register and submit a PPT proposing a business solution to one of the problem statements set by the Entrepreneurship Development Cell. Shortlisted teams then compete on event day, which opens with a live auction: teams bid for the problem statement they want to solve — easier problems carry a higher base price, harder ones a lower base price — and then spend the full day solving it through a series of tasks. Judging weighs several criteria, including how much a team spent at the auction, which turns the opening bid into a strategic decision that shapes the whole day.",
    problem:
      "The society needed to run the event's opening auction live, in the room — letting shortlisted teams bid in real time for the problem statement they wanted to take on, with every bid and every team's spend tracked accurately as it happened. A spreadsheet couldn't do it; the moment had to feel like an auction.",
    solution:
      "A live-bidding auction module built into the EDC Event Portal, where each team leader joins the bidding room and places bids on problem statements on behalf of their team, while the system tracks every bid and each team's running spend. Rather than reaching for WebSockets, the live experience runs on optimised REST/CRUD APIs with database-managed state — a deliberate choice, tuned for near-real-time responsiveness while keeping every bid consistent and auditable.",
    roleScope: "Team project, built while I was a member. I owned and built the complete backend end-to-end.",
    stack: ["Node.js", "Prisma", "PostgreSQL"],
    outcome:
      "Ran live at Founders' Pit 2026 with 30 teams bidding in real time, and worked flawlessly on the day. Recognised by faculty coordinators.",
    links: [{ label: "Auction system", private: true, note: "Private to the society" }],
    media: [
      { src: "/media/edc-auction/01.png", alt: "EDC Auction System — live bidding room" },
      { src: "/media/edc-auction/02.png", alt: "EDC Auction System — team spend tracking" },
    ],
  },
];
