import React, { FC } from 'react'
import Link from 'next/link'
import { headerData } from '../Header/Navigation/menuData'
import { footerlabels } from '@/app/api/data'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import Logo from '../Header/Logo'

const Footer: FC = () => {
  return (
    <footer className='pt-16 bg-background'>
      <div className='container px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-11 lg:gap-20 md:gap-6 sm:gap-12 gap-6  pb-16'>
          <div className='lg:col-span-4 md:col-span-6 col-span-6 flex flex-col gap-6'>
            <Logo />
            <p className='text-white/60'>Instant USDT to INR exchange.</p>
            <nav className='relative z-1 flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-[0_12px_30px_rgba(16,185,129,0.15)]'>
              <span className='inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-emerald-200/80'>
                <Icon icon='solar:shield-check-bold-duotone' className='text-base text-emerald-300' />
                Notice
              </span>
              <p className='text-sm text-white/70'>Learn about the developers’ limited involvement and who is accountable for operations.</p>
              <Link
                href='/developer-disclaimer'
                className='inline-flex items-center justify-between gap-3 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400'
              >
                <span>Read the developer disclaimer</span>
                <Icon icon='solar:alt-arrow-right-bold' className='text-lg' />
              </Link>
            </nav>
          </div>
          <div className='lg:col-span-2 md:col-span-3 col-span-6'>
            <h4 className='text-white mb-4 font-medium text-24'>Links</h4>
            <ul>
              {headerData.map((item, index) => (
                <li key={index} className='pb-4'>
                  <Link
                    href={item.href}
                    className='text-white/60 hover:text-primary text-17'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className='lg:col-span-2 md:col-span-3 col-span-6'>
            <h4 className='text-white mb-4 font-medium text-24'>Other Pages</h4>
            <ul>
              {footerlabels.map((item, index) => (
                <li key={index} className='pb-4'>
                  <Link
                    href={item.herf}
                    className='text-white/60 hover:text-primary text-17'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className='lg:col-span-3 md:col-span-4 col-span-6'>
            <h3 className='text-white text-24 font-medium mb-4'>Download app</h3>
            <div className='flex flex-col gap-4'>
              <Link href={"https://www.google.com/"}><Image src={"/images/footer/app-store-bedge.svg"} alt='play-store-bedge' width={126} height={23} /></Link>
              <Link href={"https://www.apple.com/"}><Image src={"/images/footer/app-store.svg"} alt='play-store-bedge' width={126} height={23} /></Link>
            </div>
          </div>
        </div>
        <p className='text-white/40 text-center py-8 border-t border-white/10'>Design & Develop by <Link className='hover:text-primary' href={"https://google.com/"}>Israel Govt</Link></p>
      </div>
    </footer>
  )
}

export default Footer
