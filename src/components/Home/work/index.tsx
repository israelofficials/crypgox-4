'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { featureTiles } from '@/app/api/data'

const Work = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  const TopAnimation = {
    initial: { y: '-100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  const bottomAnimation = {
    initial: { y: '100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  return (
    <section className='' id='work'>
      <div className='container px-4 mx-auto lg:max-w-(--breakpoint-xl)'>
        <div ref={ref} className='grid grid-cols-12 items-center'>
          <motion.div
            {...bottomAnimation}
            className='lg:col-span-7 col-span-12'>
            <div className='flex flex-col gap-3'>
              <p className='text-white font-medium'>
                Why choose <span className='text-primary'>our USDT-INR hub</span>
              </p>
              <h2 className='sm:text-5xl text-3xl text-white lg:w-full md:w-70% font-medium'>
                Everything you need to move USDT into Indian rupees
              </h2>
            </div>
            <div className='grid md:grid-cols-2 gap-7 mt-11'>
              {featureTiles.map((feature, index) => (
                <div key={index} className='flex items-start gap-5'>
                  <div className='p-3 bg-primary/15 rounded-full'>
                    <Image
                      src={feature.icon}
                      alt={`${feature.title} icon`}
                      width={25}
                      height={25}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <h3 className='text-white font-semibold'>{feature.title}</h3>
                    <p className='text-muted/70 text-sm'>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...TopAnimation} className='lg:col-span-5 col-span-12'>
            <div className='2xl:-mr-40 mt-9 flex justify-center'>
              <Image
                src='/images/work/work.png'
                alt='image'
                width={400}
                height={300}
                className=''
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Work
