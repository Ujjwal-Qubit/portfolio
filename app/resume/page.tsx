import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Ujjwal Kaushik",
};

export default function ResumePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-void px-6 py-24 text-center text-ink">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-mute">
        Resume
      </p>
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        {/* TODO(content): becomes a PDF viewer */}
        Coming soon
      </h1>
    </main>
  );
}
