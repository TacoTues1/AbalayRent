import Head from 'next/head'
import Footer from '../components/Footer'

export default function AboutAbalay() {
  return (
    <div className="min-h-screen bg-[#F3F4F5] text-gray-900 flex flex-col font-sans selection:bg-black selection:text-white">
      <Head>
        <title>About - Abalay</title>
        <meta
          name="description"
          content="Learn more about Abalay and our mission to modernize rental management for landlords and tenants."
        />
      </Head>

      <main className="relative flex-1 w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-16 md:pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-8 left-[10%] w-44 h-44 border border-black/10 rounded-full"></div>
          <div className="absolute top-16 left-[12%] w-44 h-44 border border-black/5 rounded-full"></div>
          <div className="absolute bottom-8 right-[6%] w-72 h-72 bg-gray-200/60 blur-3xl rounded-full"></div>
          <div className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent"></div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 rounded-[30px] bg-white border border-gray-200 p-6 sm:p-8 md:p-10 lg:p-12 shadow-[0_22px_48px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-600 mb-4">About</p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[58px] lg:leading-[1.02] font-black tracking-tight mb-4 max-w-4xl"
              style={{ fontFamily: '"Fraunces", "Georgia", serif' }}
            >
              Built from local roots, designed for modern rentals: <span style={{ fontFamily: '"Pacifico", cursive' }}>Abalay</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
              A platform for people who want less rental confusion and better day-to-day coordination between landlords and tenants.
            </p>
          </div>

          <div className="lg:col-span-4 lg:pt-10 space-y-3">
            <div className="rounded-2xl bg-black text-white p-5 border border-black shadow-lg rotate-[-1.2deg]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Name Story</p>
              <p className="mt-2 text-base font-bold">Abang + Balay</p>
              <p className="mt-1 text-xs text-gray-300 leading-relaxed">Rent and house, fused into a name that feels familiar and grounded.</p>
            </div>
            <div className="rounded-2xl bg-gray-100 p-5 border border-gray-200 translate-x-0 sm:translate-x-5 lg:translate-x-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Direction</p>
              <p className="mt-2 text-base font-bold text-gray-900">Clarity from listing to lease</p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">A practical system that removes common rental friction points.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <aside className="lg:col-span-4 order-2 lg:order-1 lg:pt-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sticky top-24">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">Impact</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-start gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black"></span><span>Clearer communication between landlords and tenants</span></p>
                <p className="flex items-start gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black"></span><span>Digitized billing and maintenance flow</span></p>
                <p className="flex items-start gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black"></span><span>More transparent and secure rental operations</span></p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <article className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8 md:p-10 shadow-[0_16px_35px_rgba(0,0,0,0.06)]">
              <div className="space-y-5 text-sm sm:text-base leading-relaxed text-gray-700">
                <p>
                  At <strong>Abalay</strong>, we believe that finding and managing a home should be as seamless as living in one. Our platform was born from a simple observation: the rental market is often fragmented, manual, and prone to miscommunication. We set out to change that.
                </p>
                <p>
                  <strong>Abalay</strong> came from words "Abang" meaning Rent and "Balay" meaning House. This name was created to be locally familiar but our goals do not end here.
                </p>
                <p>
                  <strong>Abalay</strong> is an all-in-one house rental management platform designed to bridge the gap between property owners and tenants. By integrating smart management tools with a user-friendly interface, we empower landlords to manage their properties properly while providing tenants with a transparent, secure, and modern rental experience. From listing to lease, we are upgrading the standards of property management.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}