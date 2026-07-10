/**
 * Split an outcome into its first sentence (the headline / card stat) and the
 * supporting remainder, if any.
 */
export function splitOutcome(outcome: string) {
  const end = outcome.indexOf(". ");
  if (end === -1) return { headline: outcome, support: null };
  return {
    headline: outcome.slice(0, end + 1),
    support: outcome.slice(end + 2).trim() || null,
  };
}
