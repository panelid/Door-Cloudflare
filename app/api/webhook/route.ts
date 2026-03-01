import { NextRequest, NextResponse } from 'next/server'

// Simpan jawaban sementara (di production pakai database)
const responses = new Map()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Terima jawaban dari OpenClaw
    const { message, sessionKey, runId } = body
    
    // Simpan jawaban
    if (sessionKey) {
      responses.set(sessionKey, {
        message,
        timestamp: new Date().toISOString(),
        runId
      })
    }
    
    console.log('Webhook received:', { sessionKey, message: message?.text })
    
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Endpoint buat website cek jawaban (polling sementara)
export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey')
  
  if (!sessionKey) {
    return NextResponse.json({ error: 'No sessionKey' }, { status: 400 })
  }
  
  const response = responses.get(sessionKey)
  
  if (response) {
    // Hapus setelah dibaca (sekali pakai)
    responses.delete(sessionKey)
    return NextResponse.json({ ok: true, response })
  }
  
  return NextResponse.json({ ok: false, message: 'No response yet' })
}
