import type { Metadata } from "next";
import { CanvasLayer } from "@/components/canvas/CanvasLayer";
import { About } from "@/components/home/About";
import { Constellation } from "@/components/home/Constellation";
import { Contact } from "@/components/home/Contact";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { Leadership } from "@/components/home/Leadership";
import { Nav } from "@/components/home/Nav";
import { Projects } from "@/components/home/Projects";
import { Synthesis } from "@/components/home/Synthesis";

export const metadata: Metadata = {
  title: "Ujjwal Kaushik — Full-stack & AI",
  description: "Full-stack & AI — I turn open-ended problems into shipped products.",
};

export default function Home() {
  return (
    // No bg on <main>: body paints the void, so the fixed canvas can sit at
    // negative z behind all content while remaining visible.
    <main className="grain relative flex-1 text-ink">
      <CanvasLayer />
      <Nav />
      <Hero />
      <Constellation />
      <Synthesis />
      <About />
      <Projects />
      <Journey />
      <Leadership />
      <Contact />
      <footer className="pb-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-mute/70">
        Signal from Noise · © 2026 Ujjwal Kaushik
      </footer>
    </main>
  );
}
