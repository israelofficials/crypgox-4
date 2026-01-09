import React from 'react'
import Hero from '@/components/Home/Hero'
import Work from '@/components/Home/work'
import Perks from '@/components/Home/perks'
import { Metadata } from 'next'
import GlobalReach from '@/components/Home/GlobalReach'
import CardSlider from '@/components/Home/Hero/slider'
import MarketList from '@/components/Home/MarketList'
import Faq from '@/components/Home/Faq'
import PlatformPrice from '@/components/Home/PlatformPrice'
export const metadata: Metadata = {
  title: 'crypgox',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <PlatformPrice />
      <CardSlider />
      <Work />
      <GlobalReach/>

      <Perks />
      
      <MarketList />
      <Faq/>
    </main>
  )
}
