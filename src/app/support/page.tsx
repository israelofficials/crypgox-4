'use client'

import { useEffect, useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void
      maximize?: () => void
      toggle?: () => void
      minimize?: () => void
      embedded?: string
    }
    Tawk_LoadStart?: Date
    Tawk?: unknown
  }
}

type TawkAPI = NonNullable<Window['Tawk_API']>

const DEFAULT_TAWK_PROPERTY_ID = '6958cb8164eac9197f413a3e'
const DEFAULT_TAWK_WIDGET_ID = '1je1pjhgp'

const envPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
const envWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

const propertyId = envPropertyId || DEFAULT_TAWK_PROPERTY_ID
const widgetId = envWidgetId || DEFAULT_TAWK_WIDGET_ID
const embedContainerId = propertyId ? `tawk_${propertyId}` : undefined

const contactChannels = [
  {
    title: 'Live chat',
    description: 'Chat with our support specialists in real time for instant help.',
    icon: 'solar:chat-round-line-duotone',
  },
  {
    title: 'Raise a ticket',
    description: 'Leave a detailed message on CrypGo Help and our team will follow up within 12 hours.',
    icon: 'mdi:ticket-confirmation-outline',
    href: 'https://crypgo.tawk.help/',
  },
  {
    title: 'Knowledge base',
    description: 'Read how-tos, troubleshooting guides, and policy updates anytime.',
    icon: 'solar:book-bookmark-bold-duotone',
    href: '/#faq',
  },
]

const SupportPage = () => {
  const [widgetReady, setWidgetReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportReady, setViewportReady] = useState(false)

  const embedId = embedContainerId

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQuery.matches)
    setViewportReady(true)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange)
    } else {
      mediaQuery.addListener(handleMediaChange)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [])

  useEffect(() => {
    if (!viewportReady) return
    if (typeof window === 'undefined') return
    if (!propertyId || !widgetId) return

    const previousScript = document.getElementById('tawk-widget-script')
    if (previousScript) {
      previousScript.remove()
    }

    const previousContainers = document.querySelectorAll('[id^="tawkchat"]')
    previousContainers.forEach(node => {
      node.remove()
    })

    const win = window as Window
    win.Tawk = undefined
    win.Tawk_LoadStart = new Date()
    const api: TawkAPI = (win.Tawk_API = {} as TawkAPI)

    if (isMobile && embedId) {
      api.embedded = embedId
      const container = document.getElementById(embedId)
      if (container) {
        container.innerHTML = ''
      }
    } else if (embedId && api.embedded === embedId) {
      api.embedded = undefined
    }

    setWidgetReady(false)
    const handleLoad = () => setWidgetReady(true)
    api.onLoad = handleLoad

    const script = document.createElement('script')
    script.id = 'tawk-widget-script'
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.body.appendChild(script)
    }

    return () => {
      script.remove()
      if (api.onLoad === handleLoad) {
        api.onLoad = undefined
      }
      if (embedId && api.embedded === embedId) {
        api.embedded = undefined
      }
    }
  }, [isMobile, embedId, viewportReady])

  const scrollToEmbedded = useCallback(() => {
    if (!embedId) return
    const element = document.getElementById(embedId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [embedId])

  const openLiveChat = useCallback(() => {
    if (typeof window === 'undefined') return
    if (isMobile) {
      scrollToEmbedded()
    } else if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize()
    }
  }, [isMobile, scrollToEmbedded])

  const openTicketForm = useCallback(() => {
    window.open('https://crypgo.tawk.help/', '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <main className="min-h-screen bg-[#050913] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-16">
        <header className="space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary/80">
            <Icon icon="solar:lifebuoy-bold" className="text-base" />
            Support centre
          </span>
          <h1 className="text-3xl font-semibold sm:text-4xl">How can we help today?</h1>
          <p className="mx-auto max-w-2xl text-sm text-white/60 sm:text-base">
            Our specialists are online around the clock to assist with onboarding, deposits, verification, and anything else you need.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openLiveChat}
              disabled={!widgetReady}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
            >
              <Icon icon="solar:chat-round-bold" className="text-lg" />
              {widgetReady ? 'Start live chat' : 'Loading chat…'}
            </button>
            <button
              onClick={openTicketForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Icon icon="solar:document-add-bold" className="text-lg" />
              Raise a ticket
            </button>
          </div>
          <p className="text-xs text-white/40 sm:hidden">
            Tip: the chat bubble floats above the bottom-right corner on mobile; tap it to switch between live chat and the ticket form.
          </p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {contactChannels.map(channel => (
            <div key={channel.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-primary/40 hover:bg-primary/10">
              <Icon icon={channel.icon} className="text-3xl text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{channel.title}</h2>
              <p className="mt-2 text-sm text-white/60">{channel.description}</p>
              {channel.href && (
                <Link href={channel.href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Explore guides
                  <Icon icon="solar:arrow-right-up-bold" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {propertyId && widgetId && embedId && (
          <div className="mt-12 sm:hidden">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl">
              <div id={embedId} className="w-full" style={{ height: '560px' }} />
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-white/10 bg-[#0b1122]/80 p-6 backdrop-blur">
          <h3 className="text-xl font-semibold">Need priority assistance?</h3>
          <p className="mt-2 text-sm text-white/60">
            Start a live chat using the bubble in the bottom-right corner (or the buttons above). When our agents are offline the same widget automatically switches to a ticket form—leave your phone number and details so we can reply by SMS and email.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <Icon icon="solar:clock-circle-bold" className="text-base text-primary" />
              24x7 human support
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <Icon icon="solar:shield-check-bold" className="text-base text-primary" />
              End-to-end encrypted conversations
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <Icon icon="solar:document-add-bold" className="text-base text-primary" />
              Attach screenshots & documents
            </span>
          </div>
        </div>

        {!propertyId || !widgetId ? (
          <div className="mt-10 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            <p className="font-semibold">Tawk.to widget not configured</p>
            <p className="mt-1">
              Set <code>NEXT_PUBLIC_TAWK_PROPERTY_ID</code> and <code>NEXT_PUBLIC_TAWK_WIDGET_ID</code> to enable live chat.
            </p>
          </div>
        ) : (
          <p className="mt-10 text-center text-xs text-white/40">
            Chat widget {widgetReady ? 'ready — look for the bubble near the bottom of the screen.' : 'loading… if it does not appear, please refresh the page.'}
          </p>
        )}
      </section>
    </main>
  )
}

export default SupportPage
