import type { Metadata } from "next";
import { About } from "@/components/home/About";
import { Constellation } from "@/components/home/Constellation";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { Leadership } from "@/components/home/Leadership";
import { Nav } from "@/components/home/Nav";
import { Projects } from "@/components/home/Projects";

export const metadata: Metadata = {
  title: "Ujjwal Kaushik — Full-stack & AI",
  description: "Full-stack & AI — I turn open-ended problems into shipped products.",
};

export default function Home() {
  return (
    <main className="grain relative flex-1 bg-void text-ink">
      <Nav />
      <Hero />
      <Constellation />
      <About />
      <Projects />
      <Journey />
      <Leadership />
    </main>
  );
}
