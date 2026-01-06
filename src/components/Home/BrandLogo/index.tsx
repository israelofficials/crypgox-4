'use client';
import Slider from 'react-infinite-logo-slider';

function BrandLogo() {
    const domains = ['crypgox.cloud', 'crypgox.com', 'www.crypgox.cloud', 'www.crypgox.com'];

    return (
        <section>
            <div className="2xl:py-20 py-11">
                <div className="container">
                    <div className="gap-4">
                        <div className="flex justify-center text-center py-4 relative">
                            <p className="text-white font-medium text-sm sm:text-base">
                                Official domains · <span className='text-primary font-semibold'>stay safe, always verify the URL</span>
                            </p>
                        </div>

                        <div className="py-3 Xsm:py-7">
                            <Slider
                                width="220px"
                                duration={16}
                                pauseOnHover
                                blurBorders={false}
                            >
                                {domains.map((domain, index) => (
                                    <Slider.Slide key={domain + index}>
                                        <div className='mr-10 w-full h-full flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white text-sm sm:text-base font-semibold'>
                                            {domain}
                                        </div>
                                    </Slider.Slide>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}

export default BrandLogo;
