'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

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
          { event: '*', schema: 'public', table: 'metrics' }, 
          () => {
            // When the Monday 06:00 AM pipeline finishes writing to DB,
            // this silently tells Next.js to re-fetch the Server Component data!
            router.refresh()
          }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // This is a pure logic component, it renders nothing
}
