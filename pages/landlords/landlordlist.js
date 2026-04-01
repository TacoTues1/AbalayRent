import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '@/components/Footer'

export default function LandlordList() {
  const [landlords, setLandlords] = useState([])
  const [landlordReviewMap, setLandlordReviewMap] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLandlords()
  }, [])

  async function loadLandlords() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, created_at')
      .eq('role', 'landlord')
      .order('created_at', { ascending: false })
    
    if (data) {
      setLandlords(data)

      const landlordIds = data.map(ll => ll.id)
      if (landlordIds.length > 0) {
        const { data: ratingRows } = await supabase
          .from('landlord_ratings')
          .select('landlord_id, rating')
          .in('landlord_id', landlordIds)

        const stats = {}
        landlordIds.forEach(id => {
          stats[id] = { avg: 0, count: 0 }
        })

        ;(ratingRows || []).forEach(row => {
          if (!stats[row.landlord_id]) {
            stats[row.landlord_id] = { avg: 0, count: 0, total: 0 }
          }
          stats[row.landlord_id].count += 1
          stats[row.landlord_id].total = (stats[row.landlord_id].total || 0) + Number(row.rating || 0)
        })

        Object.keys(stats).forEach(id => {
          const count = stats[id].count || 0
          const total = stats[id].total || 0
          stats[id].avg = count > 0 ? total / count : 0
          delete stats[id].total
        })

        setLandlordReviewMap(stats)
      } else {
        setLandlordReviewMap({})
      }
    }
    setLoading(false)
  }

  const filteredLandlords = landlords.filter(ll => {
    const fullName = `${ll.first_name || ''} ${ll.last_name || ''}`.toLowerCase()
    return fullName.includes(search.toLowerCase()) || (ll.city && ll.city.toLowerCase().includes(search.toLowerCase()))
  })

  // Format joined date helper
  const getJoinedText = (dateString) => {
    if (!dateString) return 'Recently joined'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffMonths / 12)

    if (diffYears > 0) {
      const remainingMonths = diffMonths % 12
      if (remainingMonths > 0) return `Joined ${diffYears} yr${diffYears > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''} ago`
      return `Joined ${diffYears} yr${diffYears > 1 ? 's' : ''} ago`
    }
    if (diffMonths > 0) return `Joined ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    return 'Joined recently'
  }

  return (
    <>
      <Head>
        <title>Landlords | Abalay</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-[#F7F7F7] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Meet our Landlords</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">Find trusted property owners in your area. Browse profiles to see their available properties and history.</p>
          </div>

          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Search by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 py-3.5 text-sm focus:border-black outline-none transition-shadow hover:shadow-sm focus:shadow-md"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : filteredLandlords.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-2">No landlords found</h3>
              <p className="text-gray-500">We couldn't find any landlords matching your search.</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-6 text-sm font-bold bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLandlords.map(ll => (
                <Link key={ll.id} href={`/landlords/landlordprofile?id=${ll.id}`} className="block">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-transparent shadow-sm flex-shrink-0">
                        {ll.avatar_url ? (
                          <img src={ll.avatar_url} alt={ll.first_name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-full h-full text-gray-400 p-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">
                          {ll.first_name} {ll.last_name || ''}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          <span className="text-xs font-bold text-gray-800">{(landlordReviewMap[ll.id]?.avg || 0).toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({landlordReviewMap[ll.id]?.count || 0} reviews)</span>
                        </div>
                        {ll.city && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="truncate">{ll.city}</span>
                          </div>
                        )}
                        <div className="inline-block mt-3 px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-md border border-gray-100">
                          {getJoinedText(ll.created_at)}
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
      <Footer />
    </>
  )
}
