import { NextRequest, NextResponse } from 'next/server'

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'https://www.telekom.id/api/chat'
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || ''

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
    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// GET untuk cek status/history (opsional)
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, message: 'API aktif' })
}
