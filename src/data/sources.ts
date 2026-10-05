/**
 * Source registry for anything numeric or factual.
 *
 * Rule: a statistic renders only if `verified` is true and a source is attached.
 * The institutional version of the site calls `verifiedStat()` and gets null
 * for anything else — the section then omits the number rather than hedging it.
 *
 * As of this build there are no verified external statistics. The brief's
 * "54 nations" is the count of African Union member states and is treated as
 * a definition, not a statistic.
 */
export interface SourcedStat {
  id: string;
  value: string;
  label: string;
  year: number | null;
  source: string;
  url: string | null;
  verified: boolean;
  note?: string;
}

export const sources: readonly SourcedStat[] = [
  {
    id: 'african-nations',
    value: '54',
    label: 'African nations',
    year: null,
    source: 'African Union membership (sovereign member states, excluding suspended-status nuance)',
    url: 'https://au.int/en/member_states/countryprofiles2',
    verified: true,
    note: 'Used as a definition of the platform’s scope, never as a participation count.',
  },
];

export function verifiedStat(id: string): SourcedStat | null {
  const s = sources.find((x) => x.id === id);
  return s && s.verified && s.source ? s : null;
}
