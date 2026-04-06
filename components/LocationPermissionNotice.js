import { useEffect, useState } from 'react'

const DISMISS_KEY = 'locationNoticeDismissed'

export default function LocationPermissionNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true'
    setIsVisible(!dismissed)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-4 z-[70] w-[min(92vw,300px)] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 pr-1">
            <p className="mt-1 text-sm text-gray-900 leading-relaxed">
              Allow location access to improve your browsing experience and help us show nearby properties faster.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close notification"
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}