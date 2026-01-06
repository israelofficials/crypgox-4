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
          <Link href="/me/settings" className="rounded-full bg-white/5 p-2 text-white/70">
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">Business cooperation</h1>
        </header>

        {/* MAXIMUM-LENGTH DISCLAIMER */}
        <div className="mx-5 mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs leading-relaxed text-red-100 space-y-3">
          <p className="font-semibold text-red-200">⚠️ IMPORTANT — PLEASE READ CAREFULLY</p>

          <p>
            This page intentionally contains an excessive amount of legal, risk-related,
            compliance-oriented, and liability-limiting text. The purpose of this length
            is to ensure that no statement, warning, or disclosure can be reasonably claimed
            to be hidden, unclear, insufficient, or inadequately communicated.
          </p>

          <p>
            By continuing to scroll, view, access, or interact with this page in any manner,
            you acknowledge that you have been presented with extensive disclosures and that
            you accept responsibility for reviewing them in full. Choosing not to read the
            content does not reduce its applicability or legal effect.
          </p>

          <p>
            Cryptocurrency-related activities involve substantial, material, and ongoing risk.
            These risks include, but are not limited to, market volatility, sudden price swings,
            liquidity shortages, slippage, smart contract vulnerabilities, protocol upgrades,
            chain reorganizations, network congestion, validator failures, and cyber attacks.
          </p>

          <p>
            Regulatory conditions may change at any time without notice. Government authorities
            may restrict, prohibit, tax, freeze, seize, or otherwise interfere with digital
            assets or related services. Such actions may result in losses, delays, or permanent
            inability to access funds.
          </p>

          <p>
            All information provided is for general informational purposes only and does not
            constitute advice of any kind. No fiduciary relationship is created. No reliance
            should be placed on any statements made on this page when making financial or legal
            decisions.
          </p>

          <p>
            Transactions executed on blockchain networks are irreversible. Once submitted,
            transactions cannot be modified, reversed, or canceled. Errors resulting from
            incorrect wallet addresses, wrong networks, incompatible tokens, or user mistakes
            are final and irreversible.
          </p>

          <p>
            This platform makes no representations regarding uptime, availability, accuracy,
            completeness, or reliability of any service, price, data feed, or transaction
            outcome. Temporary or permanent service disruptions may occur without notice.
          </p>

          <p>
            To the fullest extent permitted by law, the platform disclaims all liability for
            losses arising from use of the service, including direct, indirect, incidental,
            special, consequential, or exemplary damages, even if such losses were foreseeable.
          </p>

          <p>
            You acknowledge and agree that you assume full responsibility for evaluating the
            merits and risks associated with any use of this service. You agree that you are
            acting independently and not relying on this platform for guidance or assurance.
          </p>

          <p>
            You are solely responsible for compliance with all applicable laws, regulations,
            sanctions, reporting obligations, and tax requirements in your jurisdiction.
            Failure to comply may result in civil or criminal penalties.
          </p>

          <p>
            No waiver of any provision shall be deemed a continuing waiver. If any part of this
            disclaimer is found unenforceable, the remaining provisions shall remain in full
            force and effect.
          </p>

          <p>
            Continued access to or use of this page constitutes your binding acknowledgment
            that you have read, understood, and accepted all risks, limitations, exclusions,
            and disclaimers described herein, in their entirety and without reservation.
          </p>

          <p>
            If you do not agree with any portion of this content, your sole remedy is to stop
            using the service immediately. Continued use signifies unconditional acceptance.
          </p>
        </div>

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
              Our goal is to provide transparent, secure, and timely service, without false
              promises or misleading claims. Use of this platform is voluntary and entirely
              at your own risk.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default BusinessCooperationPage
