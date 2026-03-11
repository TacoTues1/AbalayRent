import Head from 'next/head'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'
import { useEffect, useState, useRef } from 'react'

const ScrollSection = ({ children, className }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef(null);

    useEffect(() => {
        const currentRef = domRef.current;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(currentRef);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <section
            ref={domRef}
            className={`${className} transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.4,0,1)] transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
                }`}
        >
            {children}
        </section>
    );
};

export default function About() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const steps = [
        {
            id: 1,
            title: "Create Your Profile",
            description: "Register as a Landlord or Tenant. Complete your verified profile to gain full access to the Abalay platform.",
            icon: <img src="profileicon.png" alt="Profile 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain" />,
            badgeText: "Step 1",
            badgeColor: "bg-blue-100 text-blue-700"
        },
        {
            id: 2,
            title: "List or Explore Properties",
            description: "Landlords publish listings with details, photos, and prices. Tenants search, filter, and compare properties easily.",
            icon: <img src="houseicon.png" alt="House 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain" />,
            badgeText: "Step 2",
            badgeColor: "bg-emerald-100 text-emerald-700"
        },
        {
            id: 3,
            title: "Book Viewings & Connect",
            description: "Request property viewings and chat directly with landlords through our built-in messaging features.",
            icon: <img src="https://img.icons8.com/3d-fluency/188/handshake.png" alt="Handshake 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain" />,
            badgeText: "Step 3",
            badgeColor: "bg-purple-100 text-purple-700"
        },
        {
            id: 4,
            title: "Manage Rent & Maintenance",
            description: "Pay rent and bills online, submit maintenance requests instantly, all perfectly organized for both parties.",
            icon: <img src="maintenanceicon.png" alt="Wrench 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain" />,
            badgeText: "Step 4",
            badgeColor: "bg-rose-100 text-rose-700"
        },
        {
            id: 5,
            title: "Automated Sending Bills",
            description: "Our system automatically generates and sends monthly rent and utility bills for timely payments.",
            icon: <img src="https://img.icons8.com/3d-fluency/188/receipt.png" alt="Receipt 3D Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain" />,
            badgeText: "Step 5",
            badgeColor: "bg-amber-100 text-amber-700"
        }
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-black selection:text-white">
            <Head>
                <title>How It Works - Abalay</title>
                <meta name="description" content="Learn how Abalay simplifies the renting process for landlords and tenants." />
            </Head>

            <main className="flex-1 w-full max-w-[1800px] mx-auto overflow-hidden">

                {/* Hero Section */}
                <section className="relative pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-14 md:pb-16 px-4 sm:px-6 lg:px-8 text-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 to-transparent -z-10 pointer-events-none" />
                    <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4">
                            How <span style={{ fontFamily: '"Pacifico", cursive' }} className="text-black font-normal">Abalay</span> Works
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto font-medium leading-relaxed">
                            Bringing landlords and tenants together seamlessly in just a few simple steps.
                        </p>
                    </div>
                </section>

                {/* Steps Container */}
                <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 space-y-10 sm:space-y-14 md:space-y-16 lg:space-y-20">
                    {steps.map((step, index) => {
                        const isEven = index % 2 !== 0;

                        return (
                            <ScrollSection
                                key={step.id}
                                className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-6 sm:gap-8 md:gap-10 lg:gap-16`}
                            >
                                {/* Visual / Graphic Side */}
                                <div className="w-full md:w-5/12 flex justify-center">
                                    <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] aspect-square rounded-2xl sm:rounded-3xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center justify-center p-4 sm:p-6 group hover:shadow-xl transition-all duration-500 overflow-visible">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 z-0 rounded-2xl sm:rounded-3xl"></div>

                                        {/* Decorative blurs */}
                                        <div className="absolute -top-6 -right-6 w-20 h-20 sm:w-28 sm:h-28 bg-gray-100 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                                        <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-28 sm:h-28 bg-gray-200 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

                                        {/* Icon Container */}
                                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-black">
                                            <div className="relative transition-all duration-500 ease-out flex flex-col items-center justify-center transform group-hover:scale-105 group-hover:-translate-y-2">
                                                <div className={`p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-[0px_10px_20px_rgba(0,0,0,0.08)] ${step.badgeColor} bg-opacity-5 animate-bounce transition-transform duration-500`} style={{ animationDuration: '4s' }}>
                                                    <div className="filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] transition-transform duration-500">
                                                        {step.icon}
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/10 rounded-[50%] blur-lg animate-pulse" style={{ animationDuration: '4s' }}></div>
                                            </div>

                                            <div className="text-[60px] sm:text-[80px] md:text-[100px] font-black text-gray-900/[0.03] leading-none absolute z-0 select-none bottom-0 right-2 pointer-events-none">
                                                {step.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Side */}
                                <div className="w-full md:w-7/12 space-y-2 sm:space-y-3 text-center md:text-left">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase ${step.badgeColor} shadow-sm border border-black/5`}>
                                        {step.badgeText}
                                    </div>

                                    <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                        {step.title}
                                    </h2>

                                    <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                                        {step.description}
                                    </p>

                                    <div className="pt-1 sm:pt-2 flex justify-center md:justify-start">
                                        <button
                                            onClick={() => router.push(index === 0 ? '/register' : index === 1 ? '/properties/allProperties' : '/dashboard')}
                                            className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900 hover:text-black transition-colors"
                                        >
                                            {index === 0 ? 'Get Started Now' : index === 1 ? 'Browse Properties' : 'Go to Dashboard'}
                                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </ScrollSection>
                        );
                    })}
                </div>

                {/* Call to Action Callout */}
                <ScrollSection className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
                    <div className="max-w-2xl lg:max-w-3xl mx-auto bg-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">Ready to find a place or list one?</h2>
                            <p className="text-gray-400 font-medium mb-5 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm md:text-base">
                                Join landlords and tenants already experiencing the easiest way to handle rentals through Abalay.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button onClick={() => router.push('/register')} className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    Register as Tenant
                                </button>
                                <button onClick={() => router.push('/register-landlord')} className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-transparent border-2 border-white/20 text-white text-sm font-bold rounded-full hover:bg-white/10 transition-all">
                                    Become a Landlord
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollSection>

            </main>

            <Footer />
        </div>
    )
}
