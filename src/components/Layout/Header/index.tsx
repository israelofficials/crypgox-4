'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { headerData } from '../Header/Navigation/menuData'
import Logo from './Logo'
import HeaderLink from '../Header/Navigation/HeaderLink'

const Header: React.FC = () => {
  const pathUrl = usePathname()

  const [sticky, setSticky] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [announcementHeight, setAnnouncementHeight] = useState(0)

  const announcementRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const updateHeight = () => {
      if (showAnnouncement && announcementRef.current) {
        setAnnouncementHeight(announcementRef.current.offsetHeight)
      } else {
        setAnnouncementHeight(0)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [showAnnouncement])

  const headerTop = useMemo(() => `${announcementHeight}px`, [announcementHeight])

  return (
    <>
      {showAnnouncement && (
        <div
          ref={announcementRef}
          className='fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 px-5 py-3 text-sm text-white/70 backdrop-blur-lg'>
          <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:google-play' className='text-primary text-xl' />
              <span className='font-medium tracking-wide'>Official app only supports Android</span>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/downloads/bahratx-android.apk'
                download
                className='flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary/80'
              >
                <Icon icon='solar:download-linear' className='text-base' />
                Download app
              </Link>
              <button
                type='button'
                onClick={() => setShowAnnouncement(false)}
                className='text-white/60 transition hover:text-white'
                aria-label='Dismiss announcement'
              >
                <Icon icon='solar:close-circle-linear' className='text-xl' />
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className={`fixed z-40 w-full transition-all duration-300 ${sticky ? 'bg-background pb-4 pt-5 shadow-lg' : 'pb-4 pt-6 md:pb-5 md:pt-7'}`}
        style={{ top: headerTop }}>
        <div className='py-2'>
          <div className='container flex items-center justify-between px-4'>
            <Logo />
            <nav className='hidden lg:flex grow items-center justify-center gap-8'>
              {headerData.map((item, index) => (
                <HeaderLink key={index} item={item} />
              ))}
            </nav>
            <div className='hidden items-center gap-5 sm:flex'>
              <Link
                href='/login'
                className='rounded-lg border border-primary bg-primary px-4 py-2 text-white transition-colors hover:bg-transparent hover:text-primary'>
                Login
              </Link>
              <Link href='/support' className='rounded-full border border-white/15 p-2 transition hover:border-primary/60 hover:bg-primary/10'>
                <img src='/support.png' alt='Support' className='h-7 w-7' />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
