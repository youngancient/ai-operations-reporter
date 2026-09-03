'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

export function RealtimeListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel('reports-listener')
      .on('postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {

          // 1. Ignore if the user manually triggered a refresh via the button
          if (typeof window !== 'undefined' && sessionStorage.getItem('is_manual_refresh') === 'true') {
            console.log('Ignoring realtime event due to manual refresh flag.')
            return
          }

          // 2. Show a deduplicated toast instead of silently rug-pulling the data
          toast.info('New live data is available', {
            action: {
              label: 'Update',
              onClick: () => router.refresh()
            },
            closeButton: true,
            duration: Infinity,
            id: 'realtime-update-toast'
          })
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Supabase Realtime Status:', status)
        if (err) console.error('Supabase Realtime Error:', err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // This is a pure logic component, it renders nothing
}
