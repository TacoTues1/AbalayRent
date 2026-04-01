import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { normalizeImageForUpload } from '../lib/imageCompression'
import { Button, Input, Badge, Spinner } from './UI'
import { showToast } from 'nextjs-toast-notify'
import { useRouter } from 'next/router'

async function adminFetch(table, select = '*', filters = [], order = null) {
  const res = await fetch('/api/admin/list-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, select, filters, order })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to fetch data')
  return json.data || []
}

function useRealTimeClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

function AnimatedCounter({ value, prefix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, '')) || 0
    if (num === 0) { setDisplay(0); return }
    let start = 0; const step = Math.ceil(num / (duration / 16))
    const timer = setInterval(() => { start += step; if (start >= num) { setDisplay(num); clearInterval(timer) } else setDisplay(start) }, 16)
    return () => clearInterval(timer)
  }, [value, duration])
  return <>{prefix}{display.toLocaleString()}</>
}

export default function AdminDashboard({ session, profile }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'properties', label: 'All Properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'payments', label: 'Payment History', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'bookings', label: 'Bookings List', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'schedules', label: 'Schedule Days', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  async function handleLogout() {
    if (!confirm("Are you sure you want to log out?")) return
    try {
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      showToast.success("Logged out successfully")
      window.location.href = '/'
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = '/'
    }
  }

  const clock = useRealTimeClock()
  const greeting = clock.getHours() < 12 ? 'Good Morning' : clock.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'
  const currentLabel = navItems.find(n => n.id === activeTab)?.label || 'Overview'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gray-50">
      {/* SIDEBAR (Desktop) */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 bg-[#1a1a2e]`}>
        <div className={`p-6 ${sidebarCollapsed ? 'px-4' : ''} flex items-center justify-between`}>
          {!sidebarCollapsed && (
            <h1 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-white"></span>
              <span className="text-white">Admin</span><span className="text-gray-400">Panel</span>
            </h1>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === item.id
                ? 'text-white bg-white/15'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-white/5 space-y-3 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gray-600 flex-shrink-0">
              {profile?.first_name?.[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-bold">Administrator</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer group border border-red-500/10`}>
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!sidebarCollapsed && 'Log Out'}
          </button>
        </div>
      </aside>

      {/* MOBILE NAV (Bottom Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-between px-4 py-3 pb-5 overflow-x-auto border-t border-gray-800 bg-[#1a1a2e]">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-2xl transition-all cursor-pointer flex-shrink-0 ${activeTab === item.id ? 'text-white bg-white/15 transform -translate-y-1.5' : 'text-slate-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
          </button>
        ))}
        <button onClick={handleLogout} className="p-3 rounded-2xl text-red-400 hover:bg-red-900/30 cursor-pointer flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Admin</span><span>/</span><span className="text-gray-700 font-semibold">{currentLabel}</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{greeting}, {profile?.first_name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 tabular-nums">{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px] text-gray-400 font-medium">{clock.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gray-700">{profile?.first_name?.[0]}</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 w-full max-w-[1400px] mx-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'properties' && <PropertiesView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'bookings' && <BookingsView />}
          {activeTab === 'schedules' && <SchedulesView />}
          {activeTab === 'profile' && <AdminProfileView session={session} profile={profile} />}
        </main>
      </div>
    </div>
  )
}


function DeleteModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-7 text-center shadow-2xl mx-4 border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl transition-all cursor-pointer hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

function EmptyStateRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-16 text-center">
        <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-semibold text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  )
}

// --- SUB-VIEWS ---

function OverviewView() {
  const [stats, setStats] = useState({ users: 0, properties: 0, bookings: 0, revenue: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthlyStatementReport, setMonthlyStatementReport] = useState(null)
  const [monthlyStatementLastRun, setMonthlyStatementLastRun] = useState(null)
  const [monthlyStatementLastSource, setMonthlyStatementLastSource] = useState(null)
  const [monthlyStatementHistory, setMonthlyStatementHistory] = useState([])
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [togglingReminders, setTogglingReminders] = useState(false)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [bulkEmailRecipients, setBulkEmailRecipients] = useState('')
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailBody, setBulkEmailBody] = useState('')
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false)

  useEffect(() => { loadStats(); checkReminderStatus(); loadMonthlyStatementStatus(); }, [])

  async function checkReminderStatus() {
    try {
      const { data, error } = await supabase.from('system_settings').select('value').eq('key', 'reminders_enabled').single()
      if (error) {
        console.warn("Could not fetch reminder status (table may not exist):", error.message)
        setRemindersEnabled(true)
        return
      }
      if (data) setRemindersEnabled(data.value === true || data.value === 'true')
    } catch (e) {
      console.error("Failed to load settings", e)
      setRemindersEnabled(true)
    }
  }

  async function loadMonthlyStatementStatus() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['monthly_statements_last_run_at', 'monthly_statements_last_run_source', 'monthly_statements_run_history'])

      if (error || !data) return

      const map = Object.fromEntries((data || []).map((item) => [item.key, item.value]))
      setMonthlyStatementLastRun(map.monthly_statements_last_run_at || null)
      setMonthlyStatementLastSource(map.monthly_statements_last_run_source || null)

      const rawHistory = map.monthly_statements_run_history
      let parsedHistory = []
      if (Array.isArray(rawHistory)) {
        parsedHistory = rawHistory
      } else if (typeof rawHistory === 'string') {
        try {
          const parsed = JSON.parse(rawHistory)
          if (Array.isArray(parsed)) parsedHistory = parsed
        } catch {
          parsedHistory = []
        }
      }
      setMonthlyStatementHistory(parsedHistory.slice(0, 10))
    } catch {
      // Ignore read errors so dashboard remains usable.
    }
  }

  async function toggleReminders() {
    if (!confirm(`Are you sure you want to ${remindersEnabled ? 'STOP' : 'START'} sending automated reminders?`)) return

    setTogglingReminders(true)
    try {
      const newState = !remindersEnabled
      const res = await fetch('/api/admin/toggle-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: newState })
      })
      if (res.ok) {
        setRemindersEnabled(newState)
        showToast.success(`Reminders ${newState ? 'STARTED' : 'STOPPED'} successfully`)
      } else {
        showToast.error("Failed to toggle reminders")
      }
    } catch (e) {
      showToast.error("Error: " + e.message)
    } finally {
      setTogglingReminders(false)
    }
  }

  function resetBulkEmailForm() {
    setBulkEmailRecipients('')
    setBulkEmailSubject('')
    setBulkEmailBody('')
  }

  async function sendBulkEmailFromAdmin() {
    const parsedEmails = Array.from(
      new Set(
        bulkEmailRecipients
          .split(/[\n,;]+/)
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean)
      )
    )

    if (parsedEmails.length === 0) {
      showToast.error('Please add at least one recipient email')
      return
    }

    if (!bulkEmailSubject.trim() || !bulkEmailBody.trim()) {
      showToast.error('Subject and body are required')
      return
    }

    setSendingBulkEmail(true)
    try {
      const res = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: parsedEmails,
          subject: bulkEmailSubject.trim(),
          body: bulkEmailBody.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send bulk email')
      }

      const failedCount = data.failed?.length || 0
      showToast.success(`Email sent: ${data.sent || 0} success, ${failedCount} failed`)

      if (failedCount > 0) {
        console.warn('Bulk email failures:', data.failed)
      }

      resetBulkEmailForm()
      setShowBulkEmailModal(false)
    } catch (err) {
      showToast.error(err.message || 'Failed to send bulk email')
    } finally {
      setSendingBulkEmail(false)
    }
  }

  async function loadStats() {
    setLoading(true)
    const [usersRes, propsRes, bookingsData, paymentsData] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name, role, created_at', { count: 'exact' }).eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('properties').select('id', { count: 'exact' }).eq('is_deleted', false),
      adminFetch('bookings', 'id'),
      adminFetch('payment_requests', 'rent_amount, water_bill, electrical_bill, other_bills', [{ type: 'in', column: 'status', value: ['paid', 'completed', 'confirmed'] }])
    ])

    const totalRevenue = paymentsData?.reduce((sum, p) => {
      const rent = parseFloat(p.rent_amount || 0)
      const water = parseFloat(p.water_bill || 0)
      const elec = parseFloat(p.electrical_bill || 0)
      const other = parseFloat(p.other_bills || 0)
      return sum + rent + water + elec + other
    }, 0) || 0
    setStats({
      users: usersRes.count || 0,
      properties: propsRes.count || 0,
      bookings: bookingsData.length || 0,
      revenue: totalRevenue
    })
    setRecentUsers(usersRes.data || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: '#2563eb' },
    { label: 'Properties', value: stats.properties, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', bg: '#7c3aed' },
    { label: 'Bookings', value: stats.bookings, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: '#d97706' },
    { label: 'Total Revenue', value: stats.revenue, prefix: '₱', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: '#059669' },
  ]

  if (loading) return <Spinner />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-default" style={{ backgroundColor: card.bg }}>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
              </div>
              <p className="text-2xl font-black">{card.prefix ? <AnimatedCounter value={card.value} prefix={card.prefix} /> : <AnimatedCounter value={card.value} />}</p>
              <p className="text-sm font-medium text-white/70 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Automated Processes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
          Automated Processes
        </h3>
        <div className="flex flex-col lg:flex-row items-stretch gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base">Monthly Statements</h4>
            <p className="text-sm text-gray-500 mt-1">Send payment statements to tenants and financial overviews to landlords via email.</p>
            <p className="text-xs text-gray-600 font-semibold mt-3 bg-gray-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full">
              Auto-sends via Supabase cron at end of month, 12:00 AM PH time / Click to send manually
            </p>
            {monthlyStatementLastRun && (
              <p className="text-xs text-gray-500 mt-2">
                Last run: {new Date(monthlyStatementLastRun).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                {' '}({monthlyStatementLastSource === 'pg_cron' ? 'cron' : 'manual'})
              </p>
            )}

            {monthlyStatementHistory.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 space-y-1.5">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Recent Run Records</p>
                {monthlyStatementHistory.map((item) => (
                  <div
                    key={item.id || `${item.runAt}-${item.source}`}
                    className="text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-t border-gray-100 pt-1.5 first:border-t-0 first:pt-0"
                  >
                    <span>
                      {item.runAt ? new Date(item.runAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown time'}
                      {' '}({item.source === 'pg_cron' ? 'cron' : 'manual'})
                    </span>
                    <span>
                      T: {item.tenants?.processed || 0}/{item.tenants?.total || 0} | L: {item.landlords?.processed || 0} | F: {(item.tenants?.failed || 0) + (item.landlords?.failed || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={async (e) => {
              const btn = e.currentTarget
              const originalText = btn.innerText
              btn.innerText = 'Sending...'
              btn.disabled = true
              try {
                const res = await fetch('/api/admin/send-monthly-statements', { method: 'POST' })
                const data = await res.json()
                if (res.ok) {
                  setMonthlyStatementReport(data)
                  setMonthlyStatementLastRun(data.lastRunAt || null)
                  setMonthlyStatementLastSource(data.source || 'manual_admin')
                  if (Array.isArray(data.historyPreview)) {
                    setMonthlyStatementHistory(data.historyPreview)
                  }
                  showToast.success(`Sent to ${data.tenants?.processed || 0} tenants and ${data.landlords?.processed || 0} landlords`)
                }
                else { showToast.error(data.error || 'Failed to send statements') }
              } catch (err) { showToast.error("Failed to connect to server") }
              finally { btn.innerText = originalText; btn.disabled = false }
            }}
            className="self-center px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            Send Now
          </button>
        </div>

        {monthlyStatementReport && (
          <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-gray-900">Last Monthly Statement Report</h5>
              <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">{monthlyStatementReport.period}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-bold text-gray-900">Tenants</p>
                <p className="text-xs text-gray-500 mt-1">Processed: {monthlyStatementReport.tenants?.processed || 0} / {monthlyStatementReport.tenants?.total || 0}</p>
                <p className="text-xs text-red-600 mt-1">Failed: {monthlyStatementReport.tenants?.errors?.length || 0}</p>
                {(monthlyStatementReport.tenants?.sentRecipients?.length || 0) > 0 && (
                  <div className="mt-2 max-h-28 overflow-y-auto text-xs text-gray-700 space-y-1">
                    {monthlyStatementReport.tenants.sentRecipients.map((r, i) => (
                      <p key={`tenant-sent-${i}`}>Sent: {r.email}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-bold text-gray-900">Landlords</p>
                <p className="text-xs text-gray-500 mt-1">Processed: {monthlyStatementReport.landlords?.processed || 0}</p>
                <p className="text-xs text-amber-600 mt-1">Skipped overlap: {monthlyStatementReport.landlords?.skippedTenantOverlap || 0}</p>
                <p className="text-xs text-red-600 mt-1">Failed: {monthlyStatementReport.landlords?.errors?.length || 0}</p>
                {(monthlyStatementReport.landlords?.sentRecipients?.length || 0) > 0 && (
                  <div className="mt-2 max-h-28 overflow-y-auto text-xs text-gray-700 space-y-1">
                    {monthlyStatementReport.landlords.sentRecipients.map((r, i) => (
                      <p key={`landlord-sent-${i}`}>Sent: {r.email}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(monthlyStatementReport.tenants?.errors?.length || 0) > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-xs text-red-700 max-h-28 overflow-y-auto space-y-1">
                {monthlyStatementReport.tenants.errors.map((e, i) => (
                  <p key={`tenant-err-${i}`}>Tenant error: {e.tenant || e.occupancyId || 'Unknown'} - {e.error}</p>
                ))}
              </div>
            )}

            {(monthlyStatementReport.landlords?.errors?.length || 0) > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-xs text-red-700 max-h-28 overflow-y-auto space-y-1">
                {monthlyStatementReport.landlords.errors.map((e, i) => (
                  <p key={`landlord-err-${i}`}>Landlord error: {e.landlord || e.landlordId || 'Unknown'} - {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reminder Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 mt-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base">Payment Reminders</h4>
            <p className="text-sm text-gray-500 mt-1">Automatically email/SMS tenants about upcoming due dates.</p>
            <div className="mt-2">
              {remindersEnabled ? (
                <span className="text-xs text-green-700 font-bold bg-green-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ACTIVE
                </span>
              ) : (
                <span className="text-xs text-red-700 font-bold bg-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> STOPPED
                </span>
              )}
            </div>
          </div>
          <button
            onClick={toggleReminders}
            disabled={togglingReminders}
            className={`self-center px-6 py-3 font-bold rounded-xl transition-all cursor-pointer min-w-[140px] whitespace-nowrap ${remindersEnabled
              ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200'
              : 'text-white shadow-lg hover:opacity-90'
              }`}
            style={!remindersEnabled ? { backgroundColor: '#059669' } : {}}
          >
            {togglingReminders ? 'Processing...' : remindersEnabled ? 'Stop Reminders' : 'Start Reminders'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 mt-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base">Bulk Email</h4>
            <p className="text-sm text-gray-500 mt-1">Compose and send one message to multiple email recipients.</p>
            <p className="text-xs text-gray-600 font-semibold mt-3 bg-gray-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full">
              Add recipients separated by comma, semicolon, or new line
            </p>
          </div>
          <button
            onClick={() => setShowBulkEmailModal(true)}
            className="self-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer min-w-[170px] whitespace-nowrap"
          >
            Compose Bulk Email
          </button>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
          Recent Users
          <span className="text-xs text-gray-400 font-medium ml-auto">Last 5 registered</span>
        </h3>
        <div className="space-y-3">
          {recentUsers.map((user, idx) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-indigo-50/50 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gray-600">
                  {user.first_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'landlord' ? 'info' : 'success'}>{user.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      {showBulkEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">Send Bulk Email</h3>
              <button
                onClick={() => {
                  if (!sendingBulkEmail) {
                    setShowBulkEmailModal(false)
                  }
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer"
                disabled={sendingBulkEmail}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Recipients</label>
                <textarea
                  rows={5}
                  value={bulkEmailRecipients}
                  onChange={(e) => setBulkEmailRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Body</label>
                <textarea
                  rows={8}
                  value={bulkEmailBody}
                  onChange={(e) => setBulkEmailBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowBulkEmailModal(false)
                  resetBulkEmailForm()
                }}
                disabled={sendingBulkEmail}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendBulkEmailFromAdmin}
                disabled={sendingBulkEmail}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {sendingBulkEmail ? 'Sending...' : 'Send Emails'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsersView() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({ first_name: '', middle_name: '', last_name: '', email: '', phone: '', password: '', role: 'tenant', birthday: '', gender: '', avatar_url: '' })
  const [isCreating, setIsCreating] = useState(false)
  useEffect(() => { fetchUsers() }, [])
  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, email')
      .eq('is_deleted', false)
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setUsers(data || [])
    setLoading(false)
  }
  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase()
    const matchesSearch = user.first_name?.toLowerCase().includes(term) || user.last_name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term) || user.phone?.includes(term)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  async function handleUpdate() {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          email: editForm.email,
          password: editForm.password,
          profileData: {
            first_name: editForm.first_name,
            middle_name: editForm.middle_name,
            last_name: editForm.last_name,
            role: editForm.role,
            phone: editForm.phone,
            email: editForm.email,
            birthday: editForm.birthday || null,
            gender: editForm.gender || null,
            avatar_url: editForm.avatar_url || null
          }
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      showToast.success("User updated successfully!")
      setEditingUser(null)
      setEditForm({})
      fetchUsers()
    } catch (error) {
      showToast.error("Update failed: " + error.message)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteId })
      })
      if (!response.ok) throw new Error('Failed to delete')
      showToast.success("User deleted successfully")
      fetchUsers()
    } catch (err) {
      showToast.error("Failed to delete user")
    }
    setDeleteId(null)
  }

  async function handleCreateUser() {
    if (!newUserForm.first_name || !newUserForm.last_name || !newUserForm.email || !newUserForm.password) {
      showToast.error("Please fill in all required fields")
      return
    }
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      showToast.success("User created successfully!")
      setShowAddModal(false)
      setNewUserForm({ first_name: '', middle_name: '', last_name: '', email: '', phone: '', password: '', role: 'tenant', birthday: '', gender: '', avatar_url: '' })
      fetchUsers()
    } catch (error) {
      showToast.error("Failed to create user: " + error.message)
    }
    setIsCreating(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Users Directory</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage tenants and landlords.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-white font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 justify-center shadow-lg shadow-indigo-200"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add User
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-wider">User</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-wider">Email / Phone</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 md:p-5">
                      <div className="font-bold text-gray-900 text-sm md:text-base whitespace-nowrap">{user.first_name} {user.middle_name ? user.middle_name + ' ' : ''}{user.last_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id.slice(0, 8)}...</div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{user.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 md:p-5">
                      <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'landlord' ? 'info' : 'success'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 md:p-5 flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingUser(user); setEditForm({ ...user, password: '' }); }}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <EmptyStateRow colSpan={4} message="No users found." />}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-gray-400">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" value={editForm.first_name || ''} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
                <Input label="Middle Name" value={editForm.middle_name || ''} onChange={e => setEditForm({ ...editForm, middle_name: e.target.value })} />
              </div>
              <Input label="Last Name" value={editForm.last_name || ''} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />

              <div className="h-px bg-gray-100 my-2"></div>

              <Input label="Email Address" type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              <Input label="Phone Number" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" type="date" value={editForm.birthday ? editForm.birthday.split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, birthday: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={editForm.gender || ''}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 cursor-pointer bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <Input label="Avatar URL" type="url" value={editForm.avatar_url || ''} onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })} placeholder="https://example.com/avatar.png" />

              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1">Set New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password to reset..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                    value={editForm.password || ''}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Leave blank to keep current password.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3 cursor-pointer bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-8">
              <Button variant="secondary" className="flex-1 py-3.5 cursor-pointer rounded-xl" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button className="flex-1 py-3.5 text-white hover:opacity-90 cursor-pointer rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }} onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Create New User</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-gray-400">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name *" value={newUserForm.first_name} onChange={e => setNewUserForm({ ...newUserForm, first_name: e.target.value })} />
                <Input label="Middle Name" value={newUserForm.middle_name} onChange={e => setNewUserForm({ ...newUserForm, middle_name: e.target.value })} />
              </div>
              <Input label="Last Name *" value={newUserForm.last_name} onChange={e => setNewUserForm({ ...newUserForm, last_name: e.target.value })} />
              <div className="h-px bg-gray-100 my-2"></div>
              <Input label="Email Address *" type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} />
              <Input label="Phone Number" value={newUserForm.phone} onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" type="date" value={newUserForm.birthday} onChange={e => setNewUserForm({ ...newUserForm, birthday: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={newUserForm.gender}
                    onChange={e => setNewUserForm({ ...newUserForm, gender: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 cursor-pointer bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <Input label="Avatar URL" type="url" value={newUserForm.avatar_url} onChange={e => setNewUserForm({ ...newUserForm, avatar_url: e.target.value })} placeholder="https://example.com/avatar.png" />
              <Input label="Password *" type="password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} />
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3 cursor-pointer bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-8">
              <Button variant="secondary" className="flex-1 py-3.5 cursor-pointer rounded-xl" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                className="flex-1 py-3.5 text-white hover:opacity-90 cursor-pointer rounded-xl shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}
                onClick={handleCreateUser}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete User" message="Are you sure you want to delete this user? They will no longer be able to log in." />
    </div>
  )
}

function PropertiesView() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingProp, setEditingProp] = useState(null)
  const [propForm, setPropForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [imageUrls, setImageUrls] = useState([''])
  const [uploadingImages, setUploadingImages] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadProperties() }, [])

  async function loadProperties() {
    setLoading(true)
    const { data, error } = await supabase.from('properties').select('*, landlord_profile:profiles!properties_landlord_fkey(first_name, last_name)').eq('is_deleted', false).order('created_at', { ascending: false })
    if (error) console.error(error)
    else setProperties(data || [])
    setLoading(false)
  }

  function openEditModal(p) {
    setEditingProp(p)
    setPropForm({ ...p })
    setImageUrls(p.images && p.images.length > 0 ? [...p.images] : [''])
  }

  async function handleImageUpload(e, index) {
    const file = e.target.files?.[0]
    if (e.target) e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast.error('Please upload an image file'); return }

    setUploadingImages(prev => ({ ...prev, [index]: true }))
    try {
      const uploadFile = await normalizeImageForUpload(file)
      const fileExt = uploadFile.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 10)
      const fileName = `admin/${Date.now()}_${randomId}.${fileExt}`
      const { data, error } = await supabase.storage.from('property-images').upload(fileName, uploadFile)
      if (error) throw error
      const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
      setImageUrls(prev => { const newUrls = [...prev]; newUrls[index] = publicUrlData.publicUrl; return newUrls })
    } catch (error) {
      showToast.error(error.message || 'Error uploading image')
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }))
    }
  }

  function removeImageSlot(index) {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls.length === 0 ? [''] : newUrls)
  }

  async function handleUpdateProperty() {
    const validImageUrls = imageUrls.filter(url => url && url.trim() !== '')
    const { error } = await supabase.from('properties').update({
      title: propForm.title, address: propForm.address, city: propForm.city, price: propForm.price,
      description: propForm.description, bedrooms: propForm.bedrooms, bathrooms: propForm.bathrooms,
      area_sqft: propForm.area_sqft, status: propForm.status, utilities_cost: propForm.utilities_cost,
      internet_cost: propForm.internet_cost, association_dues: propForm.association_dues,
      building_no: propForm.building_no, street: propForm.street, zip: propForm.zip,
      location_link: propForm.location_link, owner_phone: propForm.owner_phone, owner_email: propForm.owner_email,
      amenities: propForm.amenities || [], terms_conditions: propForm.terms_conditions,
      images: validImageUrls.length > 0 ? validImageUrls : null
    }).eq('id', editingProp.id)
    if (error) showToast.error("Failed to update property")
    else { showToast.success("Property updated successfully"); setEditingProp(null); loadProperties() }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const response = await fetch('/api/admin/delete-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: deleteId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete property')
      showToast.success("Property deleted")
      loadProperties()
    } catch (err) {
      showToast.error(err.message || "Failed to delete")
    }
    setDeleteId(null)
  }

  const filtered = properties.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.city || '').toLowerCase().includes(search.toLowerCase()) || (p.address || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const availableAmenities = ['Wifi', 'Air Condition', 'Washing Machine', 'Parking', 'Hot Shower', 'Bathroom', 'Smoke Alarm', 'Veranda', 'Fire Extinguisher', 'Outside Garden', 'Furnished', 'Semi-Furnished', 'Pet Friendly', 'Kitchen', 'Smart TV']

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">All Properties</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage listings and view associated landlords.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-64" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium w-full sm:w-auto">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="not available">Not Available</option>
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Property</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Landlord</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Specs</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 whitespace-nowrap">{p.title}</div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">{p.city}, {p.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-5 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {p.landlord_profile ? `${p.landlord_profile.first_name} ${p.landlord_profile.last_name}` : 'Unknown'}
                    </td>
                    <td className="p-4 md:p-5 text-sm whitespace-nowrap">
                      <div className="font-bold">₱{Number(p.price).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{p.bedrooms}bd • {p.bathrooms}ba • {p.area_sqft}sqft</div>
                    </td>
                    <td className="p-4 md:p-5"><Badge variant={p.status === 'available' ? 'success' : p.status === 'occupied' ? 'warning' : 'danger'}>{p.status}</Badge></td>
                    <td className="p-4 md:p-5 text-right flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="text-black bg-gray-100 hover:bg-black hover:text-white font-bold text-xs cursor-pointer px-3 py-2 rounded-lg transition-colors whitespace-nowrap">Edit Details</button>
                      <button onClick={() => setDeleteId(p.id)} className="text-red-600 hover:text-white hover:bg-red-600 font-bold text-xs cursor-pointer px-3 py-2 bg-red-50 rounded-lg transition-colors whitespace-nowrap">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyStateRow colSpan={5} message="No properties found." />}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL - Full Details Including Images */}
      {editingProp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Edit Property</h3>
              <button onClick={() => setEditingProp(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-gray-400">✕</button>
            </div>

            {/* Image Management */}
            <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Property Photos (Max 10)
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <label className="cursor-pointer block h-full">
                      {url ? (
                        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-green-300 relative group">
                          <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-xs transition-colors ${uploadingImages[index] ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-300 text-gray-400 hover:border-gray-500'}`}>
                          {uploadingImages[index] ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : <span className="text-lg">+</span>}
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index)} disabled={uploadingImages[index]} />
                    </label>
                    {url && imageUrls.length > 1 && (
                      <button type="button" onClick={() => removeImageSlot(index)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center cursor-pointer shadow-sm border border-white hover:bg-red-600">×</button>
                    )}
                  </div>
                ))}
                {imageUrls.length < 10 && (
                  <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-500 transition-colors text-lg">+</button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Max 2MB per image. Click to upload or replace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input label="Property Title" value={propForm.title || ''} onChange={e => setPropForm({ ...propForm, title: e.target.value })} />
              </div>
              <Input label="City" value={propForm.city || ''} onChange={e => setPropForm({ ...propForm, city: e.target.value })} />
              <Input label="Barangay / Address" value={propForm.address || ''} onChange={e => setPropForm({ ...propForm, address: e.target.value })} />
              <Input label="Building No." value={propForm.building_no || ''} onChange={e => setPropForm({ ...propForm, building_no: e.target.value })} />
              <Input label="Street" value={propForm.street || ''} onChange={e => setPropForm({ ...propForm, street: e.target.value })} />
              <Input label="ZIP Code" value={propForm.zip || ''} onChange={e => setPropForm({ ...propForm, zip: e.target.value })} />
              <Input label="Google Map Link" value={propForm.location_link || ''} onChange={e => setPropForm({ ...propForm, location_link: e.target.value })} />
              <Input label="Owner Phone" value={propForm.owner_phone || ''} onChange={e => setPropForm({ ...propForm, owner_phone: e.target.value })} />
              <Input label="Owner Email" value={propForm.owner_email || ''} onChange={e => setPropForm({ ...propForm, owner_email: e.target.value })} />
              <Input label="Bedrooms" type="number" value={propForm.bedrooms || ''} onChange={e => setPropForm({ ...propForm, bedrooms: e.target.value })} />
              <Input label="Bathrooms" type="number" value={propForm.bathrooms || ''} onChange={e => setPropForm({ ...propForm, bathrooms: e.target.value })} />
              <Input label="Area (Sqft)" type="number" value={propForm.area_sqft || ''} onChange={e => setPropForm({ ...propForm, area_sqft: e.target.value })} />
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select value={propForm.status} onChange={e => setPropForm({ ...propForm, status: e.target.value })} className="w-full border rounded-xl px-4 py-3 cursor-pointer bg-white focus:ring-2 focus:ring-black outline-none">
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="not available">Not Available</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-2 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Financials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Monthly Price (₱)" type="number" value={propForm.price || ''} onChange={e => setPropForm({ ...propForm, price: e.target.value })} />
                  <Input label="Assoc Dues (₱)" type="number" value={propForm.association_dues || ''} onChange={e => setPropForm({ ...propForm, association_dues: e.target.value })} />
                  <Input label="Utilities (₱)" type="number" value={propForm.utilities_cost || ''} onChange={e => setPropForm({ ...propForm, utilities_cost: e.target.value })} />
                  <Input label="Internet (₱)" type="number" value={propForm.internet_cost || ''} onChange={e => setPropForm({ ...propForm, internet_cost: e.target.value })} />
                </div>
              </div>
              {/* Amenities */}
              <div className="md:col-span-2 pt-2 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map(amenity => (
                    <button key={amenity} type="button" onClick={() => {
                      const current = propForm.amenities || []
                      setPropForm({ ...propForm, amenities: current.includes(amenity) ? current.filter(a => a !== amenity) : [...current, amenity] })
                    }} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${(propForm.amenities || []).includes(amenity) ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-all resize-none" rows={4} value={propForm.description || ''} onChange={e => setPropForm({ ...propForm, description: e.target.value })} />
              </div>
              {/* Terms & Conditions URL */}
              <div className="md:col-span-2">
                <Input label="Terms & Conditions URL" value={propForm.terms_conditions || ''} onChange={e => setPropForm({ ...propForm, terms_conditions: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-8">
              <Button variant="secondary" className="flex-1 py-3.5 cursor-pointer rounded-xl" onClick={() => setEditingProp(null)}>Cancel</Button>
              <Button className="flex-1 py-3.5 bg-black text-white hover:bg-gray-800 cursor-pointer rounded-xl" onClick={handleUpdateProperty}>Update Property</Button>
            </div>
          </div>
        </div>
      )}
      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Property" message="Are you sure? This will remove the property from the listing." />
    </div>
  )
}

function PaymentsView() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [landlords, setLandlords] = useState([])
  const [selectedLandlordId, setSelectedLandlordId] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const rawPayments = await adminFetch('payment_requests', '*, property:properties(id, title, landlord_profile:profiles!properties_landlord_fkey(id, first_name, last_name)), tenant_profile:profiles!payment_requests_tenant_fkey(id, first_name, last_name)', [], { column: 'created_at', ascending: false })
      // Compute display amount: use amount field, or sum components
      const enriched = rawPayments.map(p => ({
        ...p,
        display_amount: p.amount || (parseFloat(p.rent_amount || 0) + parseFloat(p.water_bill || 0) + parseFloat(p.electrical_bill || 0) + parseFloat(p.other_bills || 0))
      }))
      setPayments(enriched)
      const uniqueLandlords = []
      const map = new Map()
      for (const p of enriched) {
        const lProfile = p.property?.landlord_profile
        if (lProfile && !map.has(lProfile.id)) {
          map.set(lProfile.id, true)
          uniqueLandlords.push({ id: lProfile.id, name: `${lProfile.first_name} ${lProfile.last_name}` })
        }
      }
      setLandlords(uniqueLandlords)
    } catch (error) {
      console.error('Failed to load payments:', error)
    }
    setLoading(false)
  }

  const graphData = useMemo(() => {
    const subset = selectedLandlordId === 'all' ? payments : payments.filter(p => p.property?.landlord_profile?.id === selectedLandlordId)
    const months = {}
    subset.forEach(p => {
      if (['paid', 'completed', 'confirmed'].includes(p.status)) {
        const date = new Date(p.created_at)
        const key = date.toLocaleString('default', { month: 'short' })
        if (!months[key]) months[key] = 0
        months[key] += (p.display_amount || 0)
      }
    })
    return Object.entries(months).slice(-6)
  }, [payments, selectedLandlordId])

  const maxIncome = Math.max(...graphData.map(([, val]) => val), 1)

  const filteredPayments = payments.filter(p => {
    const term = search.toLowerCase()
    const tenant = p.tenant_profile ? `${p.tenant_profile.first_name} ${p.tenant_profile.last_name}` : ''
    const landlord = p.property?.landlord_profile ? `${p.property.landlord_profile.first_name} ${p.property.landlord_profile.last_name}` : ''
    const matchesSearch = tenant.toLowerCase().includes(term) || landlord.toLowerCase().includes(term) || (p.property?.title || '').toLowerCase().includes(term)
    const matchesLandlord = selectedLandlordId === 'all' || p.property?.landlord_profile?.id === selectedLandlordId
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesLandlord && matchesStatus
  })

  if (loading) return <Spinner />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></span>
              Income Analytics
            </h3>
            <p className="text-sm text-gray-500 mt-1">Showing: <span className="font-bold text-gray-900">{selectedLandlordId === 'all' ? 'All Landlords' : landlords.find(l => l.id === selectedLandlordId)?.name}</span></p>
          </div>
          <select value={selectedLandlordId} onChange={(e) => setSelectedLandlordId(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium w-full md:w-auto">
            <option value="all">All Landlords (Total)</option>
            {landlords.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
          </select>
        </div>
        <div className="flex items-end justify-between h-52 gap-3 px-2 pt-4 overflow-x-auto">
          {graphData.length === 0 ? <div className="w-full h-full flex items-center justify-center text-gray-400 italic">No income data</div> :
            graphData.map(([month, value]) => (
              <div key={month} className="flex flex-col items-center flex-1 group min-w-[55px]">
                <div className="relative w-full flex items-end justify-center h-44 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <div className="w-full mx-1.5 rounded-t-xl transition-all duration-700 ease-out group-hover:opacity-90 bg-gray-800" style={{ height: `${Math.max((value / maxIncome) * 100, 5)}%` }}></div>
                  <div className="absolute top-2 bg-white shadow-lg border border-gray-100 text-gray-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1">₱{value.toLocaleString()}</div>
                </div>
                <p className="mt-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{month}</p>
              </div>
            ))
          }
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div><h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Transaction History</h2><p className="text-gray-500 text-sm">Full log of payments.</p></div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input placeholder="Search transaction..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-64" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium w-full sm:w-auto">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="confirmed">Confirmed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Date</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Tenant</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Landlord</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Property</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase text-right">Amount</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 md:p-5 text-xs text-gray-500 font-mono whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 md:p-5 font-bold text-gray-900 whitespace-nowrap">{p.tenant_profile?.first_name} {p.tenant_profile?.last_name}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-700 whitespace-nowrap">{p.property?.landlord_profile?.first_name || 'N/A'} {p.property?.landlord_profile?.last_name || ''}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 max-w-[150px] truncate" title={p.property?.title}>{p.property?.title || 'N/A'}</td>
                    <td className="p-4 md:p-5 text-right font-bold text-green-600 whitespace-nowrap">₱{(p.display_amount || 0).toLocaleString()}</td>
                    <td className="p-4 md:p-5 text-right whitespace-nowrap"><Badge variant={['paid', 'completed', 'confirmed'].includes(p.status) ? 'success' : p.status === 'overdue' ? 'danger' : 'warning'}>{p.status}</Badge></td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && <EmptyStateRow colSpan={6} message="No transactions found." />}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingsView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadBookings() }, [])

  async function loadBookings() {
    setLoading(true)
    try {
      const bookingsData = await adminFetch('bookings', '*', [], { column: 'created_at', ascending: false })
      if (bookingsData && bookingsData.length > 0) {
        const propIds = [...new Set(bookingsData.map(b => b.property_id).filter(Boolean))]
        const userIds = [...new Set([...bookingsData.map(b => b.tenant), ...bookingsData.map(b => b.landlord)].filter(Boolean))]

        let propMap = {}
        let userMap = {}

        if (propIds.length > 0) {
          const props = await adminFetch('properties', 'id, title', [{ type: 'in', column: 'id', value: propIds }])
          propMap = props?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {}
        }
        if (userIds.length > 0) {
          const users = await adminFetch('profiles', 'id, first_name, last_name, email', [{ type: 'in', column: 'id', value: userIds }])
          userMap = users?.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}) || {}
        }

        const enriched = bookingsData.map(b => ({
          ...b,
          property_title: propMap[b.property_id]?.title || 'No Listing Available',
          tenant_name: userMap[b.tenant] ? `${userMap[b.tenant].first_name} ${userMap[b.tenant].last_name}` : 'Unknown',
          landlord_name: userMap[b.landlord] ? `${userMap[b.landlord].first_name} ${userMap[b.landlord].last_name}` : 'Unknown'
        }))
        setBookings(enriched)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
    }
    setLoading(false)
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('bookings').delete().eq('id', deleteId)
    if (error) showToast.error("Failed to delete")
    else { showToast.success("Deleted"); loadBookings() }
    setDeleteId(null)
  }

  const filtered = bookings.filter(b => {
    const matchesSearch = b.property_title.toLowerCase().includes(search.toLowerCase()) ||
      b.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      b.landlord_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const uniqueStatuses = [...new Set(bookings.map(b => b.status).filter(Boolean))]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">All Bookings</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage and review booking requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-64" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium w-full sm:w-auto">
            <option value="all">All Status</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Property</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Tenant</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Landlord</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Date</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 md:p-5 font-bold text-gray-900 text-sm whitespace-nowrap">{b.property_title}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 whitespace-nowrap">{b.tenant_name}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 whitespace-nowrap">{b.landlord_name}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 whitespace-nowrap">{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 md:p-5"><Badge variant={b.status === 'confirmed' || b.status === 'approved' ? 'success' : b.status === 'cancelled' || b.status === 'rejected' ? 'danger' : 'warning'}>{b.status}</Badge></td>
                    <td className="p-4 md:p-5 text-right">
                      <button onClick={() => setDeleteId(b.id)} className="text-red-600 hover:text-white hover:bg-red-600 font-bold text-xs cursor-pointer px-3 py-1.5 bg-red-50 rounded-lg transition-colors whitespace-nowrap">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyStateRow colSpan={6} message="No bookings found." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Booking" message="Are you sure you want to delete this booking request?" />
    </div>
  )
}


function SchedulesView() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { loadSlots() }, [])

  async function loadSlots() {
    setLoading(true)
    const { data: slotData, error } = await supabase.from('available_time_slots').select('*').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true })
    if (slotData) {
      const userIds = [...new Set(slotData.map(s => s.landlord_id).filter(Boolean))]
      const { data: users } = await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds)
      const userMap = users?.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}) || {}
      const enriched = slotData.map(s => ({
        ...s,
        landlord_name: userMap[s.landlord_id] ? `${userMap[s.landlord_id].first_name} ${userMap[s.landlord_id].last_name}` : 'Unknown',
        formatted_date: new Date(s.start_time).toLocaleDateString(),
        formatted_time: `${new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }))
      setSlots(enriched)
    }
    setLoading(false)
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('available_time_slots').delete().eq('id', deleteId)
    if (error) showToast.error("Failed to delete")
    else { showToast.success("Deleted"); loadSlots() }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Active Schedule Slots</h2>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Landlord</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Date</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Time</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 md:p-5 font-bold text-gray-900 text-sm whitespace-nowrap">{s.landlord_name}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 whitespace-nowrap">{s.formatted_date}</td>
                    <td className="p-4 md:p-5 text-sm text-gray-600 whitespace-nowrap">{s.formatted_time}</td>
                    <td className="p-4 md:p-5"><Badge variant={s.is_booked ? 'warning' : 'success'}>{s.is_booked ? 'Booked' : 'Available'}</Badge></td>
                    <td className="p-4 md:p-5 text-right">
                      <button onClick={() => setDeleteId(s.id)} className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap">Delete</button>
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && <EmptyStateRow colSpan={5} message="No active slots found." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Schedule" message="Are you sure you want to remove this time slot?" />
    </div>
  )
}

function AdminProfileView({ session, profile }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    middle_name: profile?.middle_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    birthday: profile?.birthday || '',
    gender: profile?.gender || '',
  })
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    async function getEmail() {
      if (session?.user?.email) {
        setEmail(session.user.email)
      }
    }
    getEmail()
  }, [session])

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        phone: form.phone,
        birthday: form.birthday || null,
        gender: form.gender || null,
      }).eq('id', profile?.id)
      if (error) throw error
      showToast.success('Profile updated successfully')
    } catch (err) {
      showToast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      showToast.error('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast.success('Password updated successfully')
      setNewPassword('')
    } catch (err) {
      showToast.error(err.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Profile</h2>
        <p className="text-gray-500 mt-1 text-sm">Update your personal information and security settings.</p>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
            <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
              value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Middle Name</label>
            <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
              value={form.middle_name} onChange={e => setForm({ ...form, middle_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
            <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
              value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
            <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Birthday</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
              value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Gender</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm cursor-pointer"
              value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
          <input type="email" disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 text-sm cursor-not-allowed" value={email} />
          <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSaveProfile} disabled={saving}
            className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-5">Security</h3>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">New Password</label>
          <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-black outline-none text-sm"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleChangePassword} disabled={savingPassword || !newPassword}
            className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}