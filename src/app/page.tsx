import React from 'react'
import Hero from '@/components/Home/Hero'
import Work from '@/components/Home/work'
import Upgrade from '@/components/Home/upgrade'
import Perks from '@/components/Home/perks'
import { Metadata } from 'next'
import BrandLogo from '@/components/Home/BrandLogo'
import GlobalReach from '@/components/Home/GlobalReach'
import CardSlider from '@/components/Home/Hero/slider'
import MarketList from '@/components/Home/MarketList'
import Faq from '@/components/Home/Faq'
export const metadata: Metadata = {
  title: 'crypgo',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <CardSlider />
      <Work />
      <GlobalReach/>
 
      <Perks />
      
      <MarketList />
      <Faq/>
    </main>
  )
}
