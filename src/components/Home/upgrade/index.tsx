import { upgradeData } from '@/app/api/data'
import Image from 'next/image'
import { Icon } from '@iconify/react'

const Upgrade = () => {
  return (
    <section className='py-20' id='upgrade'>
      <div className='container px-4'>
        <div className='grid lg:grid-cols-2 gap-10 items-center'>
          <div>
            <p className='text-white font-medium'>
              Scale your <span className='text-primary'>USDT ↔ INR desk</span>
            </p>
            <h2 className='text-white sm:text-5xl text-3xl  font-medium mb-5'>
              Infrastructure that keeps settlements instant and compliant
            </h2>
            <p className='text-muted/60 text-lg mb-7'>
              From automated KYC to reconciliation ready exports, the platform removes manual busywork so your desk can focus on locking prices and serving clients.
            </p>
            <div className='grid sm:grid-cols-2  text-nowrap gap-5'>
              {upgradeData.map((item, index) => (
                <div key={index} className='flex gap-5'>
                  <div>
                    <Icon
                      icon='la:check-circle-solid'
                      width='24'
                      height='24'
                      className='text-white group-hover:text-primary'
                    />
                  </div>
                  <div>
                    <h3 className='text-lg text-muted/60'>{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className='ml-0 lg:ml-7'>
              <Image
                src='/images/upgrade/india-dark.webp'
                alt='image'
                width={400}
                height={300}
                className='object-cover translate-x-2 lg:translate-x-30'

              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Upgrade
