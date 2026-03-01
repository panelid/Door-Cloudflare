import { NextRequest, NextResponse } from 'next/server'

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'https://www.telekom.id/api/chat'
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || ''

// Simpan jawaban sementara (di production pakai Redis/Database)
const responseStore = new Map()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionKey } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      )
    }

    // Forward ke OpenClaw Gateway
    const response = await fetch(OPENCLAW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        sessionKey: sessionKey || `web:${Date.now()}`,
        agentId: 'main',
        deliver: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenClaw error:', errorText)
      return NextResponse.json(
        { error: 'Gagal menghubungi AI' },
        { status: 502 }
      )
    }

    const data = await response.json()
    
    // Simpan runId untuk tracking
    if (data.runId) {
      responseStore.set(sessionKey, { status: 'pending', runId: data.runId })
    }
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// GET untuk polling jawaban
export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey')
  
  if (!sessionKey) {
    return NextResponse.json({ error: 'No sessionKey' }, { status: 400 })
  }

  // Cek apakah ada jawaban (dari webhook atau temp storage)
  const stored = responseStore.get(sessionKey)
  
  if (stored && stored.status === 'completed' && stored.response) {
    // Hapus setelah dibaca
    responseStore.delete(sessionKey)
    return NextResponse.json({ ok: true, response: stored.response })
  }

  return NextResponse.json({ ok: false, message: 'No response yet' })
}

// Endpoint untuk webhook (dipanggil oleh OpenClaw)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionKey, runId } = body

    if (sessionKey && message) {
      responseStore.set(sessionKey, {
        status: 'completed',
        response: message,
        runId,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
