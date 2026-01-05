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

const DeveloperDisclaimerPage = () => {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-24 bg-[#0b1220]">
        <header className="flex items-center gap-3 px-5 pt-5">
          <Link href="/me/settings" className="rounded-full bg-white/5 p-2 text-white/70">
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">Developer disclaimer</h1>
        </header>

        <div className="px-5 pt-6 pb-10 space-y-6 text-sm leading-relaxed text-white/80">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Our scope of work</h2>
            {keyPoints.map(point => (
              <p key={point}>{point}</p>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Who controls the platform?</h3>
            <p>
              The client who owns this application is solely responsible for all operational, financial, and legal
              decisions. They have complete administrative access and can modify or remove any feature without developer
              approval.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Client obligations</h3>
            <ul className="space-y-2 pl-4 list-disc">
              {responsibilities.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Accountability</h3>
            <p>
              If the platform is used for fraudulent, unlawful, or unethical activities, the responsibility lies entirely
              with the client. Developers are not liable for any damages, penalties, or losses incurred by end users or
              third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">What should you do if something feels wrong?</h3>
            <p>If you suspect misuse or notice suspicious behaviour, please:</p>
            <ul className="space-y-2 pl-4 list-disc">
              {escalation.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p>
              The development team cannot intervene directly. Only the client can disable accounts, reverse actions, or
              issue refunds.
            </p>
          </section>

          <section className="space-y-2">
            <p>
              By continuing to use this application, you acknowledge that the developers act purely as technical service
              providers. All platform conduct, compliance, and liabilities sit with the client organisation operating the
              service.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default DeveloperDisclaimerPage
