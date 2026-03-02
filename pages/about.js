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
            description: "Start by registering as a Landlord or Tenant. Complete your verified profile to gain full access to the Abalay platform, ensuring a safe and trusted community for everyone.",
            icon: <img src="profileicon.png" alt="Profile 3D Icon" className="w-40 h-40 md:w-48 md:h-48 object-contain" />,
            badgeText: "Step 1",
            badgeColor: "bg-blue-100 text-blue-700",
            imgSrc: "/home.png"
        },
        {
            id: 2,
            title: "List or Explore Properties",
            description: "Landlords can easily publish beautiful property listings with details, photos, and prices. Tenants can quickly search, filter, and compare properties to find their perfect home.",
            icon: <img src="houseicon.png" alt="House 3D Icon" className="w-40 h-40 md:w-48 md:h-48 object-contain" />,
            badgeText: "Step 2",
            badgeColor: "bg-emerald-100 text-emerald-700",
            imgSrc: "/home.png"
        },
        {
            id: 3,
            title: "Book Viewings & Connect",
            description: "Tenants can request property viewings and chat directly with landlords. Manage your appointments securely through our built-in messaging features without leaving the platform.",
            icon: <img src="https://img.icons8.com/3d-fluency/188/handshake.png" alt="Handshake 3D Icon" className="w-40 h-40 md:w-48 md:h-48 object-contain" />,
            badgeText: "Step 3",
            badgeColor: "bg-purple-100 text-purple-700",
            imgSrc: "/home.png"
        },
        {
            id: 4,
            title: "Manage Rent & Maintenance",
            description: "Once assigned, effortlessly pay rent and bills online, submit maintenance requests instantly, and let Abalay keep everything perfectly organized for both parties.",
            icon: <img src="maintenanceicon.png" alt="Wrench 3D Icon" className="w-40 h-40 md:w-48 md:h-48 object-contain" />,
            badgeText: "Step 4",
            badgeColor: "bg-rose-100 text-rose-700",
            imgSrc: "/home.png"
        },
        {
            id: 5,
            title: "Automated Sending Bills",
            description: "Say goodbye to manual tracking! Our system automatically generates and sends monthly rent and utility bills, ensuring timely payments and complete peace of mind.",
            icon: <img src="https://img.icons8.com/3d-fluency/188/receipt.png" alt="Receipt 3D Icon" className="w-40 h-40 md:w-48 md:h-48 object-contain" />,
            badgeText: "Step 5",
            badgeColor: "bg-amber-100 text-amber-700",
            imgSrc: "/home.png"
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
                <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 to-transparent -z-10 pointer-events-none" />
                    <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                            How <span style={{ fontFamily: '"Pacifico", cursive' }} className="text-black font-normal">Abalay</span> Works
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Our streamlined system process designed to bring landlords and tenants together seamlessly in just a few simple steps.
                        </p>
                    </div>
                </section>

                {/* Steps Container */}
                <div className="px-4 sm:px-6 lg:px-8 pb-32 space-y-24 md:space-y-32">
                    {steps.map((step, index) => {
                        const isEven = index % 2 !== 0; // zero-indexed so 1 and 3 are even logic-wise

                        return (
                            <ScrollSection
                                key={step.id}
                                className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24`}
                            >
                                {/* Visual / Graphic Side */}
                                <div className="w-full md:w-1/2 flex justify-center">
                                    <div className="relative w-full max-w-[500px] aspect-square rounded-[3rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 flex items-center justify-center p-8 group hover:shadow-3xl transition-all duration-700 overflow-visible" style={{ perspective: '1200px' }}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 z-0 rounded-[3rem]"></div>

                                        {/* Abstract decorative elements */}
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gray-200 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                                        {/* 3D Animated Icon Container */}
                                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-black">

                                            <div className="relative transition-all duration-700 ease-out flex flex-col items-center justify-center transform group-hover:scale-110 group-hover:-translate-y-6"
                                                style={{
                                                    transformStyle: 'preserve-3d',
                                                    transform: 'perspective(800px) rotateX(15deg) rotateY(-15deg)'
                                                }}>
                                                {/* Floating 3D Block with Hover Rotation */}
                                                <div className={`p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-white to-gray-50 shadow-[0px_20px_40px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,1)] ${step.badgeColor} bg-opacity-5 animate-bounce group-hover:rotate-y-12 transition-transform duration-700`} style={{ animationDuration: '4s' }}>
                                                    {/* The Icon itself, big and drop-shadowed */}
                                                    <div className="filter drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] [transform:translateZ(80px)] group-hover:[transform:translateZ(120px)] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                                                        {step.icon}
                                                    </div>
                                                </div>
                                                {/* Ground shadow reacting to the bounce */}
                                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/15 rounded-[50%] blur-xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                                            </div>

                                            <div className="text-[160px] font-black text-gray-900/[0.03] leading-none absolute z-0 select-none bottom-0 right-4 pointer-events-none">
                                                {step.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Side */}
                                <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase ${step.badgeColor} shadow-sm border border-black/5`}>
                                        {step.badgeText}
                                    </div>

                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                        {step.title}
                                    </h2>

                                    <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                                        {step.description}
                                    </p>

                                    <div className="pt-4 flex justify-center md:justify-start">
                                        <button
                                            onClick={() => router.push(index === 0 ? '/register' : index === 1 ? '/properties/allProperties' : '/dashboard')}
                                            className="group flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-black transition-colors"
                                        >
                                            {index === 0 ? 'Get Started Now' : index === 1 ? 'Browse Properties' : 'Go to Dashboard'}
                                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </ScrollSection>
                        );
                    })}
                </div>

                {/* Call to Action Callout */}
                <ScrollSection className="px-4 sm:px-6 lg:px-8 pb-32">
                    <div className="max-w-4xl mx-auto bg-black rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to find a place or list one?</h2>
                            <p className="text-gray-400 font-medium mb-8 max-w-xl mx-auto text-sm md:text-base">
                                Join thousands of landlords and tenants already experiencing the easiest way to handle rentals through Abalay.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={() => router.push('/register')} className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    Register as Tenant
                                </button>
                                <button onClick={() => router.push('/register-landlord')} className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">
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
