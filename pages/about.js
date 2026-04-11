import Head from 'next/head'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'
import { useEffect, useState, useRef } from 'react'

const ScrollSection = ({ children, className }) => {
    const [isVisible, setVisible] = useState(false)
    const domRef = useRef(null)

    useEffect(() => {
        const currentRef = domRef.current
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.unobserve(currentRef)
                }
            })
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        })

        if (currentRef) observer.observe(currentRef)
        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [])

    return (
        <section
            ref={domRef}
            className={`${className} transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
            {children}
        </section>
    )
}

export default function About() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const steps = [
        {
            id: '01',
            title: 'Create Your Profile',
            description: 'Register as a Landlord or Tenant. Complete your verified profile to gain full access to the Abalay platform.',
            icon: <img src="profileicon.png" alt="Profile 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />,
            actionLabel: 'Get Started Now',
            actionPath: '/register'
        },
        {
            id: '02',
            title: 'List or Explore Properties',
            description: 'Landlords publish listings with details, photos, and prices. Tenants search, filter, and compare properties easily.',
            icon: <img src="houseicon.png" alt="House 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />,
            actionLabel: 'Browse Properties',
            actionPath: '/properties/allProperties'
        },
        {
            id: '03',
            title: 'Book Viewings & Connect',
            description: 'Request property viewings and chat directly with landlords through our built-in messaging features.',
            icon: <img src="https://img.icons8.com/3d-fluency/188/handshake.png" alt="Handshake 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />,
            actionLabel: 'Go to Dashboard',
            actionPath: '/dashboard'
        },
        {
            id: '04',
            title: 'Manage Rent & Maintenance',
            description: 'Pay rent and bills online, submit maintenance requests instantly, all perfectly organized for both parties.',
            icon: <img src="maintenanceicon.png" alt="Wrench 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />,
            actionLabel: 'Go to Dashboard',
            actionPath: '/dashboard'
        },
        {
            id: '05',
            title: 'Automated Sending Bills',
            description: 'Our system automatically generates and sends monthly rent and utility bills for timely payments.',
            icon: <img src="https://img.icons8.com/3d-fluency/188/receipt.png" alt="Receipt 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />,
            actionLabel: 'Go to Dashboard',
            actionPath: '/dashboard'
        }
    ]

    return (
        <div className="min-h-screen bg-[#F3F4F5] flex flex-col font-sans selection:bg-black selection:text-white">
            <Head>
                <title>How It Works - Abalay</title>
                <meta name="description" content="Learn how Abalay simplifies the renting process for landlords and tenants." />
            </Head>

            <main className="relative flex-1 w-full max-w-[1650px] mx-auto overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute top-8 left-[8%] w-44 h-44 rounded-full border border-black/10" />
                    <div className="absolute top-14 left-[10%] w-44 h-44 rounded-full border border-black/5" />
                    <div className="absolute bottom-12 right-[6%] w-72 h-72 rounded-full bg-gray-200/60 blur-3xl" />
                </div>

                <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 lg:px-10">
                    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <div className="lg:col-span-8 rounded-[30px] bg-white border border-gray-200 p-6 sm:p-8 md:p-10 shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
                            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-4">How It Works</p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[58px] lg:leading-[1.03] font-black text-gray-900 tracking-tight mb-4">
                                A clearer rental journey with <span style={{ fontFamily: '"Pacifico", cursive' }} className="text-black font-normal">Abalay</span>
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
                                Every step is built to reduce delays, miscommunication, and manual work for both landlords and tenants.
                            </p>
                        </div>

                        <aside className="lg:col-span-4 lg:pt-10 space-y-3">
                            <div className="rounded-2xl bg-black text-white p-5 border border-black shadow-lg rotate-[-1.1deg]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Process</p>
                                <p className="mt-2 text-base font-bold">5 practical steps</p>
                                <p className="mt-1 text-xs text-gray-300 leading-relaxed">From signup to billing, each stage is visible and trackable.</p>
                            </div>
                            <div className="rounded-2xl bg-gray-100 border border-gray-200 p-5 translate-x-0 sm:translate-x-6 lg:translate-x-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Outcome</p>
                                <p className="mt-2 text-sm font-bold text-gray-900">Fewer manual tasks, faster decisions</p>
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="px-4 sm:px-6 lg:px-10 pb-14 sm:pb-16 md:pb-20">
                    <div className="relative">
                        <div className="hidden lg:block absolute left-6 top-2 bottom-2 w-px bg-gray-300"></div>

                        {steps.map((step, index) => {
                            const isOffset = index % 2 !== 0

                            return (
                                <ScrollSection
                                    key={step.id}
                                    className={`relative ${index < steps.length - 1 ? 'pb-6 sm:pb-8' : ''}`}
                                >
                                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
                                        <div className="hidden lg:flex w-12 shrink-0 items-start justify-center">
                                            <span className="z-10 mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-sm font-black shadow-md">
                                                {step.id}
                                            </span>
                                        </div>

                                        <article className={`flex-1 rounded-[26px] bg-white border border-gray-200 p-5 sm:p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md ${isOffset ? 'lg:ml-14' : 'lg:mr-14'}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
                                                <div className="md:col-span-8">
                                                    <p className="inline-flex lg:hidden items-center px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-bold tracking-wider uppercase mb-3">
                                                        Step {step.id}
                                                    </p>
                                                    <p className="hidden lg:block text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Step {step.id}</p>

                                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                                        {step.title}
                                                    </h2>

                                                    <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed mt-3 max-w-2xl">
                                                        {step.description}
                                                    </p>

                                                    <div className="pt-4 flex justify-start">
                                                        <button
                                                            onClick={() => router.push(step.actionPath)}
                                                            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-black transition-colors"
                                                        >
                                                            {step.actionLabel}
                                                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4">
                                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 min-h-[170px] sm:min-h-[190px] flex items-center justify-center p-4 sm:p-6">
                                                        {step.icon}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                </ScrollSection>
                            )
                        })}
                    </div>
                </section>

                <ScrollSection className="px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 md:pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 rounded-[28px] bg-white border border-gray-200 p-6 sm:p-8 md:p-10 shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
                        <div className="lg:col-span-7">
                            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-3">Next Move</p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">Ready to find a place or list one?</h2>
                            <p className="text-gray-600 font-medium max-w-2xl text-sm sm:text-base leading-relaxed">
                                Join landlords and tenants already using Abalay to handle rentals with less friction and better visibility.
                            </p>
                        </div>

                        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:justify-center">
                            <button onClick={() => router.push('/register')} className="w-full px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                                Register as Tenant
                            </button>
                            <button onClick={() => router.push('/register-landlord')} className="w-full px-6 py-3 bg-gray-100 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                Become a Landlord
                            </button>
                            <button onClick={() => router.push('/properties/allProperties')} className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                Explore Properties
                            </button>
                        </div>
                    </div>
                </ScrollSection>
            </main>

            <Footer />
        </div>
    )
}
