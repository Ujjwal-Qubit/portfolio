import type { Experience } from "./types";

// Source of truth: Content Dossier (B2).
export const experience: Experience[] = [
  {
    kind: "experience",
    slug: "fpt-software",
    title: "FPT Software",
    cardLine: "Sole developer on an enterprise RAG + knowledge-graph system.",
    subtitle: "Building enterprise RAG/LLM systems solo at Vietnam's largest IT company.",
    badge: "Experience",
    nda: true,
    dates: "23 Jun – 4 Aug 2026",
    location: "Ho Chi Minh City, Vietnam (Onsite, ongoing)",
    context:
      "Sole developer on an enterprise-grade full-stack AI application — Python backend, React front end, MongoDB — deployed with Podman on Azure, working within a Scrum/Agile team.",
    // ⚠️ NDA — patterns only, nothing beyond what's disclosed in the Dossier.
    whatIDid:
      "End-to-end RAG pipeline (document chunking, vector-store embedding, grounding LLM responses against a constructed knowledge graph for accuracy + source traceability); DevOps with Podman + MinIO for reproducible deployment; operating independently across the full SDLC.",
    stack: [
      "Python",
      "React.js",
      "MongoDB",
      "RAG",
      "Knowledge Graph",
      "Podman",
      "MinIO",
      "Azure",
      "LLM integration",
    ],
    outcome:
      "Sole developer of a production enterprise AI system — owning every layer from the Python backend and RAG pipeline through the React front end and MongoDB data layer, deployed via Podman on Azure. Working inside a professional Scrum team but carrying the build independently across the full SDLC: requirements, architecture, implementation, deployment. The RAG pipeline was engineered end-to-end — chunking, vector-store embedding, and grounding LLM answers against a constructed knowledge graph so every response stays accurate and traceable to its source.",
    links: [],
    // TODO(content): Dossier's Media section for this entry was blank — add real image(s) if any exist.
    media: [],
  },
  {
    kind: "experience",
    slug: "dxp-software",
    title: "DXP Software",
    cardLine: "Shipped a production system solo, the summer after first year.",
    subtitle: "Shipped a standalone production system solo across live enterprise projects.",
    badge: "Experience",
    dates: "Jun 2025 – Jul 2025",
    location: "Ho Chi Minh City, Vietnam (Onsite)",
    context:
      "Worked in a 3-person team across 3 simultaneous live client projects; delivered PowerApps + SharePoint automation digitising enterprise workflows.",
    whatIDid:
      "Worked onsite in Ho Chi Minh City in a 3-person team stretched across 3 simultaneous live client projects, delivering PowerApps and SharePoint automation that digitised enterprise client workflows. In parallel, independently owned PatientID+ end-to-end — the internship's only intern-level project to ship as a standalone, production-ready system — earning formal recognition from DXP mentors for the quality and completeness of independent engineering work. All of it the summer after first year.",
    stack: [
      "PowerApps",
      "SharePoint",
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Python",
      "OpenCV",
      "REST API",
    ],
    outcome: "Formally recognised by mentors for outstanding quality of independent engineering work.",
    recognition: "Mentor recognition, DXP Software",
    links: [],
    // TODO(content): Dossier's Media section for this entry was blank — add real image(s) if any exist.
    media: [],
  },
];
