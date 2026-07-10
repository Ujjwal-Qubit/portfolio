import type { Experience } from "./types";

// Source of truth: Site Copy (Final) doc.
export const experience: Experience[] = [
  {
    kind: "experience",
    slug: "fpt-software",
    title: "FPT Software",
    cardLine: "Sole developer on an enterprise RAG + knowledge-graph system.",
    subtitle:
      "Sole developer of an enterprise RAG and knowledge-graph system at Vietnam's largest IT company.",
    year: "2026",
    role: "Software Engineering Intern · Sole developer",
    status: "Ho Chi Minh City · Onsite",
    nda: true,
    dates: "23 Jun – 4 Aug 2026",
    location: "Ho Chi Minh City, Vietnam (Onsite, ongoing)",
    context:
      "At FPT Software — Vietnam's largest IT company and one of the biggest in South-East Asia — I work onsite in Ho Chi Minh City as the sole developer on an enterprise-grade full-stack AI application. The build spans a Python backend, a React front end, and a MongoDB data layer, deployed with Podman on Azure, and I carry it independently from inside a professional Scrum team — across requirements, architecture, implementation, and deployment.",
    // ⚠️ NDA — patterns only, nothing beyond what's disclosed in the Site Copy (Final) doc.
    work: "The heart of the project is a retrieval-augmented generation pipeline engineered end-to-end: document chunking, vector-store embedding, and grounding the LLM's answers against a constructed knowledge graph so every response stays accurate and traceable back to its source. Alongside it, I set up the DevOps foundation — Podman containers and MinIO object storage for reproducible, scalable deployment — operating independently across the full software development lifecycle in a real enterprise environment.",
    stack: [
      "Python",
      "React",
      "MongoDB",
      "RAG",
      "Knowledge Graph",
      "Podman",
      "MinIO",
      "Azure",
      "LLM integration",
    ],
    outcome: "Sole developer of a production enterprise AI system, owned end-to-end.",
    links: [],
    media: [
      {
        src: "/media/fpt-software/01.png",
        alt: "FPT Software — enterprise RAG and knowledge-graph system",
      },
    ],
  },
  {
    kind: "experience",
    slug: "dxp-software",
    title: "DXP Software",
    cardLine: "Shipped a production system solo, the summer after first year.",
    subtitle:
      "Shipped a standalone production system solo, across three live enterprise client projects — the summer after first year.",
    year: "2025",
    role: "Software Engineering Intern",
    status: "Ho Chi Minh City · Onsite",
    dates: "Jun 2025 – Jul 2025",
    location: "Ho Chi Minh City, Vietnam (Onsite)",
    context:
      "My first internship took me onsite to Ho Chi Minh City, working in a three-person team stretched across three simultaneous live client projects. The day-to-day was real client delivery — building PowerApps and SharePoint automation that digitised enterprise workflows — but the standout was a system I owned entirely on my own, the summer after my first year of engineering.",
    work: "Alongside the team's client automation work, I independently owned and shipped PatientID+ end-to-end — the internship's only intern-level project to ship as a standalone, production-ready system (its full story lives on its own page). Carrying a production system solo while contributing to three live client deliveries earned formal recognition from DXP mentors for the quality and completeness of independent engineering work.",
    stack: [
      "PowerApps",
      "SharePoint",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Python",
      "OpenCV",
      "REST API",
    ],
    outcome: "Formally recognised by mentors for outstanding quality of independent engineering work.",
    links: [],
    media: [
      { src: "/media/dxp-software/01.png", alt: "DXP Software — PowerApps and SharePoint automation" },
      { src: "/media/dxp-software/02.png", alt: "DXP Software — internship project work" },
    ],
  },
];
