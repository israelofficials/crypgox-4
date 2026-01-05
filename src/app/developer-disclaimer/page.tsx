'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'

const keyPoints = [
  'We build and maintain the software platform commissioned by the client.',
  'We do not manage funds, execute trades, or operate any wallets connected to this app.',
  'We have no authority over business decisions, user onboarding, KYC/AML processes, or operational policies.',
]

const responsibilities = [
  'Monitor how the platform is used and ensure it complies with local laws and regulations.',
  'Handle customer support, dispute resolution, and any communication with regulatory bodies.',
  'Determine exchange rates, settlement timelines, and any financial guarantees offered to users.',
]

const escalation = [
  'Immediately contact the client using the official support channels.',
  'Suspend your activity until the client provides written clarification.',
  'Report the incident to the relevant authorities if required by your local regulations.',
]

const DeveloperDisclaimerPublicPage = () => {
  return (
    <main className="min-h-screen bg-[#050b19] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 sm:px-10">
          <header className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-emerald-300/80">
              <Icon icon="solar:shield-check-bold-duotone" className="text-base text-emerald-300" />
              Important notice
            </div>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
              Developer disclaimer & scope of responsibility
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
              We are independent software developers engaged by the platform owner. The following disclosure clarifies
              our limited responsibilities and confirms that all operational control rests entirely with the client.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              >
                <Icon icon="solar:home-2-bold" className="text-lg" />
                Back to homepage
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                <Icon icon="solar:chat-square-like-bold" className="text-lg" />
                Contact platform owner
              </Link>
            </div>
          </header>

          <div className="space-y-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-10">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Our scope of work</h2>
              <ul className="space-y-3">
                {keyPoints.map(point => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/75 sm:text-base">
                    <Icon icon="solar:check-circle-bold" className="mt-0.5 text-lg text-emerald-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Who controls the platform?</h3>
              <p className="text-sm text-white/70 sm:text-base">
                The client who owns this application is solely responsible for all operational, financial, and legal
                decisions. They hold the administrative keys and can modify, suspend, or remove any feature without our
                approval.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Client obligations</h3>
              <ul className="space-y-3">
                {responsibilities.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/75 sm:text-base">
                    <Icon icon="solar:double-alt-arrow-right-bold" className="mt-0.5 text-lg text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Accountability</h3>
              <p className="text-sm text-white/70 sm:text-base">
                If the platform is used for fraudulent, unlawful, or unethical activities, full responsibility lies with the
                client. The developers are not liable for damages, penalties, or losses experienced by users or third parties.
              </p>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">What should you do if something feels wrong?</h3>
                <p className="mt-2 text-sm text-white/70 sm:text-base">If you suspect misuse or notice suspicious behaviour:</p>
              </div>
              <ul className="space-y-3">
                {escalation.map(step => (
                  <li key={step} className="flex items-start gap-3 text-sm text-white/75 sm:text-base">
                    <Icon icon="solar:list-heart-bold" className="mt-0.5 text-lg text-emerald-400" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-white/70 sm:text-base">
                The development team cannot intervene directly. Only the client can disable accounts, reverse actions, or
                issue refunds.
              </p>
            </section>

            <section>
              <p className="text-sm text-white/70 sm:text-base">
                By continuing to use this application, you acknowledge that the developers act purely as technical service
                providers. All platform conduct, compliance, and liabilities sit with the client organisation operating the
                service.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default DeveloperDisclaimerPublicPage
