import Image from 'next/image'
import { perksData } from '@/app/api/data'

const Perks = () => {
  return (
    <section className='pb-28 relative'>
      <div className='container px-4 relative z-2'>
        <div className='text-center'>
          <div className='flex flex-col gap-4'>
            <p className='text-muted text-base relative'>
              Your USDT to <span className='text-primary'>INR bridge</span>
            </p>
            <h2 className='text-white sm:text-5xl text-3xl font-medium'>
              Exchange, earn, and withdraw without friction
            </h2>
          </div>
          <div className='mt-16 border border-border grid lg:grid-cols-3 sm:grid-cols-2 py-16 gap-10 px-8 sm:px-12 lg:px-20 rounded-3xl sm:bg-perk bg-dark_grey/35 lg:bg-bottom bg-center bg-no-repeat'>
            {perksData.map((item, index) => (
              <div
                key={index}
                className='text-center flex items-center justify-end flex-col gap-6'>
                <div className='bg-primary/25 backdrop-blur-xs p-4 rounded-full w-fit'>
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={44}
                    height={44}
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <span className='uppercase tracking-[0.24em] text-xs text-primary font-semibold'>
                    {item.label}
                  </span>
                  <h3 className={`text-white text-2xl sm:text-28 ${item.space}`}>
                    {item.title}
                  </h3>
                  <p className='text-muted/70 leading-relaxed max-w-72 mx-auto'>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='bg-linear-to-br from-tealGreen to-charcoalGray sm:w-50 w-96 z-0 sm:h-50 h-96 rounded-full sm:-bottom-80 bottom-0 blur-400 absolute sm:-left-48 opacity-60'></div>
    </section>
  )
}

export default Perks
