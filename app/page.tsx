const TOKENS = [
  { name: "void", className: "bg-void" },
  { name: "depth", className: "bg-depth" },
  { name: "signal", className: "bg-signal" },
  { name: "builder", className: "bg-builder" },
  { name: "human", className: "bg-human" },
  { name: "ink", className: "bg-ink" },
  { name: "mute", className: "bg-mute" },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-24 bg-void px-6 py-24 text-ink">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-mute">
          {/* TODO(content) */}
          Signal from noise
        </p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight sm:text-7xl">
          Ujjwal Kaushik
        </h1>
      </div>

      {/* TODO(content): temporary type-proof block, remove once real homepage lands in C4 */}
      <section className="flex w-full max-w-2xl flex-col gap-8 border border-depth p-8">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-mute">
            Fonts
          </p>
          <p className="font-display text-2xl">Clash Display — display headings</p>
          <p className="font-body text-2xl">General Sans — body text</p>
          <p className="font-mono text-2xl">JetBrains Mono — code &amp; labels</p>
        </div>

        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-mute">
            Tokens
          </p>
          <div className="grid grid-cols-7 gap-2">
            {TOKENS.map((token) => (
              <div key={token.name} className="flex flex-col items-center gap-1">
                <div
                  className={`h-12 w-12 rounded border border-mute/30 ${token.className}`}
                />
                <span className="font-mono text-[10px] text-mute">
                  {token.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
