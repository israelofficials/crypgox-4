"use client";
import { GlobalReachData } from "./data";
import { Icon } from '@iconify/react'

const GlobalReach = () => {
    return (
        <section className='py-20'>
            <div className="container">
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-10'>
                    {GlobalReachData.map((item, index) => (
                        <div
                            key={index}
                            className='flex flex-col gap-4 border border-white/10 bg-white/5/80 backdrop-blur-sm px-6 py-8 rounded-2xl text-left hover:border-primary/60 transition-colors'>
                            <div className='w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary text-2xl'>
                                <Icon icon={item.icon} width={28} height={28} />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <h3 className='text-white text-xl font-semibold'>
                                    {item.title}
                                </h3>
                                <p className='text-muted/70 text-sm leading-relaxed'>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default GlobalReach