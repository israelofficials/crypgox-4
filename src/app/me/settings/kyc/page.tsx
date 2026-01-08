'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'

const KYCPage = () => {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">
        <header className="flex items-center gap-3 px-5 pt-5">
          <Link href="/me/settings" className="rounded-full bg-white/5 p-2 text-white/70">
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">KYC</h1>
        </header>

        <div className="px-5 pt-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/20 p-6">
                <Icon icon="solar:document-check-bold-duotone" className="text-6xl text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">KYC Coming Soon</h2>
              <p className="text-base sm:text-lg text-white/60 px-4">
                We&apos;re working on implementing Know Your Customer (KYC) verification to enhance security and compliance.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-[#0e1628] border border-white/10 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Icon icon="solar:info-circle-bold" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white mb-1">What is KYC?</p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    KYC (Know Your Customer) is a verification process that helps us ensure the security and legitimacy of all transactions on our platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/me/settings"
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 px-6 py-3 text-sm font-semibold text-primary transition"
              >
                <Icon icon="solar:alt-arrow-left-bold" className="text-base" />
                Back to Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default KYCPage
