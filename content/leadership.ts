import type { Leadership } from "./types";

// Source of truth: Content Dossier (B2).
export const leadership: Leadership[] = [
  {
    kind: "leadership",
    slug: "edc-technical-lead",
    title: "EDC Technical Lead",
    cardLine: "Leads 8 engineers building the platforms EDC runs on.",
    subtitle:
      "Leads an 8-engineer team owning all of EDC's technical infrastructure and live event platforms.",
    badge: "Leadership",
    dates: "Dec 2024 – Present (promoted from Technical Team Member to Technical Lead, Jun 2026)",
    context:
      "The Entrepreneurship Development Cell runs the university's flagship entrepreneurship events, and everything those events run on — the main website, the registration and shortlisting portal, the live auction system — is built and maintained by its technical team. As Technical Lead, I own that infrastructure and the team behind it: eight engineers whose daily tasks I assign, whose submissions I review, and whose blockers I clear, alongside structured growth sprints to level the team up. The role is half engineering, half translation — coordinating with EDC's non-technical departments to turn event requirements into systems that hold up in production, in the room, on event day. I was promoted from Technical Team Member to Technical Lead in June 2026 after building the backends of both live platforms.",
    roleScope:
      "Lead 8 engineers — assign tasks, review submissions, clear blockers, run growth sprints; coordinate with non-technical departments to scope + deliver.",
    outcome:
      "Manage the main EDC website; as backend lead, built and shipped the auction portal and registration system, both in production at institutional events; ran a team sprint (daily task assignment, submission reviews, unblocking).",
    recognition: "Promoted to Technical Lead (Jun 2026)",
    links: [
      // TODO(content): Dossier only captured the link-preview title ("EDC JSS"), not the actual URL — replace with the real link.
      { label: "EDC JSS", note: "TODO" },
    ],
    // TODO(content): Dossier marks this media as "TODO" — add real image(s).
    media: [],
  },
  {
    kind: "leadership",
    slug: "cpc-coordinator",
    title: "CPC Coordinator",
    cardLine: "Growing CP culture for 100+ students — bootcamps, contests, mentorship.",
    subtitle: "Runs CP initiatives for 100+ students — contests, bootcamps, and peer mentorship.",
    badge: "Leadership",
    dates: "Sep 2025 – Present",
    context:
      "The Competitive Programming Cell of the CSE Tech Council drives competitive-programming culture across a cohort of 100+ students, and I'm one of a 5-member coordinating team leading it. That has meant designing and organising Code Genesis, running a 3-week DSA Bootcamp that drew 172 registrations, and setting up a timed HackerRank contest — plus the quieter, ongoing work of mentoring peers through DSA and problem-solving, one stuck problem at a time.",
    roleScope:
      "Lead CP initiatives for 100+ students; organise events and mentor peers in DSA and problem-solving.",
    outcome: "Organised Code Genesis, a 3-week DSA Bootcamp (172 registrations), and a timed HackerRank contest.",
    links: [],
    media: [],
  },
];
