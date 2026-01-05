'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'

const policyLines = [
  'All crypto-related services, including USDT exchange, wallet transfers, and price discussions, are provided for informational and service purposes only.',
  'Cryptocurrency markets are highly volatile and involve significant risk. Prices may fluctuate rapidly, and users may experience partial or complete loss of funds.',
  'We do not provide financial, investment, or legal advice. Any transaction or decision made using our services is done solely at the user’s own discretion and risk.',
]

const keyTerms = [
  'All transfers are processed only after confirmation of funds',
  'Rates may change based on market conditions and liquidity',
  'Once a crypto transaction is completed, it is irreversible',
  'We are not responsible for losses due to incorrect wallet addresses, network delays, or third-party platform issues',
]

const compliance = [
  'Local laws and regulations',
  'KYC and AML requirements, if applicable',
]

const confirmations = [
  'You understand the risks involved in cryptocurrency transactions',
  'You are legally eligible to trade or exchange crypto',
  'You accept this policy and disclaimer in full',
]

const BusinessCooperationPage = () => {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-24 bg-[#0b1220]">
        <header className="flex items-center gap-3 px-5 pt-5">
          <Link href="/settings" className="rounded-full bg-white/5 p-2 text-white/70">
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">Business cooperation</h1>
        </header>

        <div className="px-5 pt-6 pb-10 space-y-6 text-sm leading-relaxed text-white/80">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">📜 Crypto Service Policy & Disclaimer</h2>
            {policyLines.map(line => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Key Terms:</h3>
            <ul className="space-y-2">
              {keyTerms.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p>Users are responsible for ensuring compliance with:</p>
            <ul className="space-y-2 pl-4 list-disc">
              {compliance.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p>We do not guarantee profits, fixed returns, or price stability.</p>
            <p>By using our services, you confirm that:</p>
            <ul className="space-y-2 pl-4 list-disc">
              {confirmations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <p>
              Our goal is to provide transparent, secure, and timely service, without false promises or misleading claims.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default BusinessCooperationPage
