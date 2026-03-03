'use client'

import { useLayoutEffect } from 'react'
import { useAppStore } from '@/lib/store'
import LandingPage from './(marketing)/page'

export default function Home() {
  const { theme } = useAppStore()

  // Apply theme on mount and when theme changes
  useLayoutEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Serve the landing page directly on the root
  // The layout will be handled by (marketing)/layout.tsx if we use proper routing,
  // but since this is the root app/page.tsx, we just render the LandingPage component.
  // Actually, for better consistency, we should redirect to / if we are on / but 
  // Next.js handles this automatically.

  return <LandingPage />
}
