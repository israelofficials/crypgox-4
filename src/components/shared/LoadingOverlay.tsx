'use client'

import { Icon } from '@iconify/react'

const LoadingOverlay = ({ label = 'Loading' }: { label?: string }) => {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-12 w-12 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-white/80 uppercase tracking-[0.2em]">Please wait</p>
            <p className="text-lg font-semibold text-white">{label}</p>
            <p className="text-xs text-white/50">We&apos;re fetching your data securely</p>
          </div>
          <Icon icon="solar:shield-user-bold" className="text-2xl text-primary" />
        </div>
      </div>
    </main>
  )
}

export default LoadingOverlay
