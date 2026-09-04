'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function LocalTime({ timestamp }: { timestamp: string }) {
  const [time, setTime] = useState<string>('...')

  useEffect(() => {
    setTime(format(new Date(timestamp), 'MMM d, yyyy, h:mm a'))
  }, [timestamp])

  return <span>{time}</span>
}
