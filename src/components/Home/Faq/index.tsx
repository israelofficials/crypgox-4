// components/Faq.js
'use client';
import Image from 'next/image';
import React, { useState } from 'react';// Optional: install lucide-react icons

const faqData = [
    {
        question: "What is crypgox?",
        answer: "crypgox is a specialized USDT-to-INR exchange platform designed for seamless conversion between Tether (USDT) and Indian Rupees. Deposit USDT, lock spreads against deep INR liquidity, and withdraw funds to your bank or back on-chain whenever you need.",
    },
    {
        question: "How do I sell USDT for INR?",
        answer: "Simply deposit USDT via TRC20 network to your dedicated wallet address. Once confirmed, you can instantly convert USDT to INR and receive funds via UPI (settled in under 5 minutes) or same-day NEFT (guaranteed before banking cut-off). Our real-time price-lock engine ensures transparent spreads.",
    },
    {
        question: "Can I buy USDT with INR?",
        answer: "Yes! You can purchase USDT using INR and withdraw directly to your preferred on-chain wallet. USDT arrives on your chosen network with full treasury monitoring for security and transparency.",
    },
    {
        question: "Is crypgox compliant with Indian regulations?",
        answer: "Absolutely. We operate with RBI-compliant settlements and automated KYC/AML guardrails. Every conversion is audit-ready and follows regulatory-first compliance protocols to ensure your transactions are safe and legal.",
    },
    {
        question: "How fast are INR payouts?",
        answer: "INR payouts are lightning-fast. UPI transfers are settled in under 5 minutes, while NEFT transactions are guaranteed before banking cut-off times. Our automated compliance checks run in the background, ensuring smooth withdrawals without delays.",
    },
    {
        question: "Are there any transaction fees?",
        answer: "crypgox offers transaction-free trading. Our fee structure is transparent, with spreads clearly displayed based on your transaction volume. Check our pricing page for detailed markup information and rate tiers.",
    },
    {
        question: "What support do you offer?",
        answer: "We provide 24/7 customer support, access to our dedicated USDT treasury desk for expert guidance, tutorials, trading alerts, and enterprise-grade APIs for automated operations. Whether you're a beginner or professional, our team is here to help.",
    },
    {
        question: "How secure is my USDT and personal information?",
        answer: "Security is our top priority. We use bank-grade encryption, sophisticated security measures to protect your cryptocurrency, advanced compliance protocols, and network-level monitoring for all transactions. Your funds and data are protected with enterprise-grade security standards.",
    },
];

const Faq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id='faq' className=" py-16 text-white">
            <div className="container">
                <div className=" mx-auto px-4">
                    <div className="text-center mb-10">
                        <p className="text-green-400 uppercase text-sm">Popular questions</p>
                        <h2 className="text-3xl md:text-4xl font-semibold mt-2">Learn more about crypgox</h2>
                        <p className="text-gray-400 mt-2">Your trusted USDT to INR bridge with bank-grade settlements</p>
                    </div>
                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white/5 rounded-lg p-4 cursor-pointer transition-all duration-300"
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">{item.question}</h3>
                                    <Image
                                        src={"/images/icons/plus-icon.svg"}
                                        alt='plus-icon'
                                        width={20}
                                        height={20}
                                        className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}
                                    />
                                </div>

                                <div
                                    className={`mt-2 text-gray-400 overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-40 visible' : 'max-h-0 hidden'
                                        }`}
                                >
                                    <p className="py-2">{item.answer}</p>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Faq;
