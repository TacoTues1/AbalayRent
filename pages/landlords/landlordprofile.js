import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '@/components/Footer'

export default function LandlordProfile() {
  const router = useRouter()
  const { id } = router.query
  const [landlord, setLandlord] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadLandlordProfile()
    }
  }, [id])

  async function loadLandlordProfile() {
    setLoading(true)
    
    // Get landlord details
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      
    if (profileData) {
      setLandlord(profileData)
      
      // Get landlord properties
      const { data: propsData } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
      
      if (propsData) setProperties(propsData)
    }
    
    setLoading(false)
  }

  // Format joined date helper
  const getJoinedDetailedText = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffMonths / 12)

    if (diffYears > 0) {
      const remainingMonths = diffMonths % 12
      if (remainingMonths > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
      return `${diffYears} year${diffYears > 1 ? 's' : ''}`
    }
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
    return 'Less than a month'
  }

  const formatJoinedYear = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).getFullYear()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (!landlord || landlord.role !== 'landlord') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Landlord not found</h1>
        <Link href="/landlords/landlordlist" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Return to Landlords List
        </Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{landlord.first_name}'s Profile | Abalay</title>
      </Head>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#F7F7F7] font-sans py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Side: Profile Details */}
          <div className="w-full md:w-[300px] shrink-0 bg-white border border-gray-200 p-6 flex flex-col">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mb-4 mx-auto border border-gray-200">
              {landlord.avatar_url ? (
                <img src={landlord.avatar_url} alt={landlord.first_name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </div>
            
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-1 text-center">
              {landlord.first_name} {landlord.last_name || ''}
            </h1>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Joined {formatJoinedYear(landlord.created_at)}
            </p>

            <div className="w-full border-t border-gray-100 pt-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <span className="block font-medium text-gray-900 text-sm">Tenure</span>
                  <span className="text-gray-500 text-sm">{getJoinedDetailedText(landlord.created_at)}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <div>
                  <span className="block font-medium text-gray-900 text-sm">Listings</span>
                  <span className="text-gray-500 text-sm">{properties.length} active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Properties Section */}
          <div className="flex-1 w-full md:pl-2">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">{landlord.first_name}'s Listings</h2>
              <Link href="/landlords/landlordlist" className="text-sm font-bold text-gray-500 hover:text-black hover:underline transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                All Landlords
              </Link>
            </div>
            
            {properties.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center h-64 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">No active listings</h3>
                <p className="text-gray-500 text-sm">This landlord doesn't have any properties currently publicly listed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(p => (
                  <Link key={p.id} href={`/properties/${p.id}`} className="block">
                    <div className="bg-white border border-gray-200 flex flex-col h-full">
                      <div className="relative h-[180px] w-full bg-gray-100 border-b border-gray-200">
                        <img 
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'} 
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white text-xs font-bold uppercase tracking-wider text-black border border-gray-200">
                          {p.status === 'available' ? 'Available' : 'Occupied'}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-1">{p.title}</h3>
                          <p className="text-[15px] font-bold text-black shrink-0">₱{Number(p.price).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-5 line-clamp-1">
                          <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span>{p.address}, {p.city}</span>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 text-sm font-medium text-gray-600">
                          <div className="flex items-center gap-1.5">
                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                             {p.bedrooms || 1} Bed
                          </div>
                          <div className="flex items-center gap-1.5">
                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             {p.bathrooms || 1} Bath
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
