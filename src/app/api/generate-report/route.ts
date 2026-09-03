import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json({ error: 'Server misconfiguration: N8N_WEBHOOK_URL is missing from environment.' }, { status: 500 })
  }
  // 1. Basic Auth check (ensure they have the cookie)
  const cookieStore = await cookies()
  const session = cookieStore.get('exec_session')
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Parse the request body
    const body = await request.json()
    const { selected_period, period_start, period_end } = body

    // 3. Validate input
    const validPeriods = ['last_30_days', 'last_90_days', 'ytd', 'custom']
    if (!validPeriods.includes(selected_period)) {
      return NextResponse.json({ error: 'Invalid selected_period' }, { status: 400 })
    }

    if (selected_period === 'custom' && (!period_start || !period_end)) {
      return NextResponse.json({ error: 'Custom period requires start and end dates' }, { status: 400 })
    }

    // 4. Forward to n8n Webhook
    // Note: This blocks for 4-37s depending on the pipeline
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_period,
        ...(selected_period === 'custom' && { period_start, period_end }),
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!n8nResponse.ok) {
      throw new Error(`n8n responded with status: ${n8nResponse.status}`)
    }

    const data = await n8nResponse.json()

    // 5. Return success
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error generating report:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request to generation pipeline timed out (60s).' }, { status: 504 })
    }

    return NextResponse.json({ error: 'Failed to generate report', details: error.message }, { status: 500 })
  }
}
