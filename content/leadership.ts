import type { Leadership } from "./types";

// Source of truth: Site Copy (Final) doc.
export const leadership: Leadership[] = [
  {
    kind: "leadership",
    slug: "edc-technical-lead",
    title: "EDC Technical Lead",
    cardLine: "Leads 8 engineers building the platforms EDC runs on.",
    subtitle:
      "Leads an 8-engineer team owning all of EDC's technical infrastructure and the platforms its events run on.",
    year: "Dec 2024 – Present",
    role: "Technical Lead",
    status: "Leading 8 engineers",
    dates: "Dec 2024 – Present (promoted from Technical Team Member to Technical Lead, Jun 2026)",
    context:
      "The Entrepreneurship Development Cell runs the university's flagship entrepreneurship events, and everything those events run on — the main website, the registration and shortlisting portal, the live auction system — is built and maintained by its technical team. As Technical Lead, I own that infrastructure and the team behind it.",
    work: "I lead eight engineers: assigning daily tasks, reviewing their submissions, clearing blockers, and running structured growth sprints to level the team up. Just as much of the role is translation — sitting between EDC's non-technical departments and the code, turning event requirements into systems that actually hold up in production, in the room, on event day. I was promoted from Technical Team Member to Technical Lead in June 2026, after building the backends of both live event platforms.",
    roleScope:
      "Lead 8 engineers — assign tasks, review submissions, clear blockers, run growth sprints; coordinate with non-technical departments to scope + deliver.",
    outcome:
      "Own and maintain the main EDC website; as backend lead, built and shipped both the Event Portal and the Auction System, now in production at institutional events.",
    stats: ["8 ENGINEERS", "EVENT PORTAL — LIVE", "AUCTION SYSTEM — LIVE"],
    links: [{ label: "EDC JSS", href: "https://www.edcjssun.com/" }],
    // TODO(content): no media supplied yet for this entry — add real image(s) when available.
    media: [],
  },
  {
    kind: "leadership",
    slug: "cpc-coordinator",
    title: "CPC Coordinator",
    cardLine: "Growing CP culture for 100+ students — bootcamps, contests, mentorship.",
    subtitle:
      "Grows competitive-programming culture for 100+ students — through contests, bootcamps, and peer mentorship.",
    year: "Sep 2025 – Present",
    role: "Student Coordinator",
    status: "100+ students",
    dates: "Sep 2025 – Present",
    context:
      "The Competitive Programming Cell of the CSE Tech Council exists to build competitive-programming culture across a cohort of more than a hundred students, and I'm one of a five-member team leading it. The work is part events, part mentorship — creating the reasons for people to start, and then helping them keep going.",
    work: "I've designed and organised Code Genesis, run a three-week DSA Bootcamp that drew 172 registrations, and set up a timed HackerRank contest — the visible, structured side of the role. The quieter side is the ongoing one: mentoring peers through data structures, algorithms, and problem-solving, one stuck problem at a time.",
    roleScope:
      "Lead CP initiatives for 100+ students; organise events and mentor peers in DSA and problem-solving.",
    outcome:
      "Organised Code Genesis, a 3-week DSA Bootcamp (172 registrations), and a timed HackerRank contest, while mentoring peers across the cohort.",
    stats: ["100+ STUDENTS", "172 BOOTCAMP REGISTRATIONS", "CODE GENESIS"],
    links: [],
    media: [
      { src: "/media/cpc-coordinator/01.png", alt: "Competitive Programming Cell — DSA Bootcamp" },
    ],
  },
];
