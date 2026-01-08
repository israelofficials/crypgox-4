import React, { FC } from 'react'
import Link from 'next/link'
import { headerData } from '../Header/Navigation/menuData'
import { footerlabels } from '@/app/api/data'
import Image from 'next/image'
import Logo from '../Header/Logo'

const Footer: FC = () => {
  return (
    <footer className='pt-16 bg-background'>
      <div className='container px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-11 lg:gap-20 md:gap-6 sm:gap-12 gap-6  pb-16'>
          <div className='lg:col-span-4 md:col-span-6 col-span-6 flex flex-col gap-6'>
            <Logo />
            <p className='text-white/60'>Instant USDT to INR exchange.</p>
            <nav className='flex flex-wrap gap-3 text-sm text-white/70'>
              <Link href='/' className='hover:text-primary transition'>Home</Link>
              <Link href='/exchange' className='hover:text-primary transition'>Exchange</Link>
              <Link href='/support' className='hover:text-primary transition'>Support</Link>
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
              <Link href={"/api/download/apk"}><Image src={"/images/footer/app-store-bedge.svg"} alt='play-store-badge' width={126} height={23} /></Link>
            </div>
          </div>
        </div>
        <p className='text-white/40 text-center py-8 border-t border-white/10'>© {new Date().getFullYear()} Crypgox. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
