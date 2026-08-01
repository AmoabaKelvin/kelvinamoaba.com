import { ContributionGrid } from '@/components/contribution-grid';
import { getContributions } from '@/lib/github';

export async function ContributionGraph() {
  const data = await getContributions();
  if (!data) return null;

  return (
    <section className="mt-20 md:mt-24">
      <h2 className="font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
        Activity
      </h2>
      <div className="mt-8">
        <ContributionGrid weeks={data.weeks} />
      </div>
      <p className="mt-4 font-mono text-sm text-[var(--fg-faint)] tabular-nums">
        {data.total.toLocaleString('en-US')} contributions in the past year
      </p>
    </section>
  );
}
