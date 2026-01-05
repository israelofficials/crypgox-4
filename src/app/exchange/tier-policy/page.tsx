'use client'

import Link from 'next/link'

const policyPoints = [
  {
    title: 'Dynamic spreads',
    description:
      'Markup percentages scale with order size to balance liquidity sourcing and risk. Larger tickets enjoy tighter spreads once verification is complete.',
  },
  {
    title: 'Execution windows',
    description:
      'Rates are locked for 90 seconds after you initiate a sell. Orders that are not confirmed inside this window are re-priced using the latest base rate.',
  },
  {
    title: 'Tier eligibility',
    description:
      'Eligibility is determined by rolling 30-day sell volume and successful settlement history. Manual review can fast-track access for corporate accounts.',
  },
  {
    title: 'Monitoring & audit',
    description:
      'Admin teams can adjust tiers at any time based on market volatility. All changes are logged and surfaced in the admin dashboard.',
  },
]

export default function TierPolicyPage() {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] px-5 pb-24 pt-10 space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-primary/80">Policy</p>
          <h1 className="text-3xl font-semibold">Tiered price policy</h1>
          <p className="text-sm text-white/60">
            Understand how markups are determined and how you can unlock better settlement rates on the platform.
          </p>
        </header>

        <section className="space-y-4">
          {policyPoints.map((point) => (
            <article
              key={point.title}
              className="rounded-2xl border border-white/10 bg-[#0e1628] p-4 shadow-[0_12px_30px_rgba(8,12,24,0.6)]"
            >
              <h2 className="text-lg font-semibold text-white">{point.title}</h2>
              <p className="mt-1 text-sm text-white/65">{point.description}</p>
            </article>
          ))}
        </section>

        <div className="flex justify-center">
          <Link
            href="/exchange"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm text-white/70 transition hover:text-white"
          >
            ← Back to exchange
          </Link>
        </div>
      </div>
    </main>
  )
}
