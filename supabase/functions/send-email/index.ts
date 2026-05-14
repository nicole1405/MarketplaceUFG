import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const PUBLIC_URL = Deno.env.get('PUBLIC_URL') || 'https://marketplace-ufg.netlify.app'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReqBody {
  email: string
  token: string
  type: 'confirm' | 'reset'
  userName?: string
}

function buildConfirmHtml(name: string, url: string): string {
  const n = name ? ` ${name}` : ''
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
.container{max-width:600px;margin:0 auto;padding:20px}
.header{background:linear-gradient(135deg,#1976D2 0%,#0D47A1 100%);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0}
.content{background:#f9f9f9;padding:30px}
.btn{display:inline-block;background:#1976D2;color:#fff;padding:14px 35px;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:600;font-size:16px}
.footer{background:#eee;padding:20px;text-align:center;font-size:12px;color:#666}
</style></head><body>
<div class="container"><div class="header"><h1>Marketplace UFG</h1><p>Confirma tu cuenta</p></div>
<div class="content"><h2>Hola${n}!</h2>
<p>Gracias por registrarte.</p>
<p style="text-align:center"><a href="${url}" class="btn">Confirmar mi cuenta</a></p>
<p><small>${url}</small></p>
<p>Bienvenido!</p>
<p>El equipo de Marketplace UFG</p></div>
<div class="footer"><p>Universidad Francisco Gavidia</p></div></div>
</body></html>`
}

function buildResetHtml(name: string, url: string): string {
  const n = name ? ` ${name}` : ''
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
.container{max-width:600px;margin:0 auto;padding:20px}
.header{background:linear-gradient(135deg,#1976D2 0%,#0D47A1 100%);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0}
.content{background:#f9f9f9;padding:30px}
.btn{display:inline-block;background:#1976D2;color:#fff;padding:14px 35px;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:600;font-size:16px}
.footer{background:#eee;padding:20px;text-align:center;font-size:12px;color:#666}
.warning{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}
</style></head><body>
<div class="container"><div class="header"><h1>Marketplace UFG</h1><p>Restablece tu contrasena</p></div>
<div class="content"><h2>Hola${n}!</h2>
<p>Recibimos una solicitud para restablecer tu contrasena.</p>
<p style="text-align:center"><a href="${url}" class="btn">Restablecer Contrasena</a></p>
<p><small>${url}</small></p>
<div class="warning"><strong>Importante:</strong> Enlace expira en 1 hora.</div>
<p>El equipo de Marketplace UFG</p></div>
<div class="footer"><p>Universidad Francisco Gavidia</p></div></div>
</body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }
  try {
    const { email, token, type, userName }: ReqBody = await req.json()
    if (!email || !token || !type) {
      return new Response(JSON.stringify({ error: 'email, token y type son requeridos' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      })
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY no configurada' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      })
    }
    const baseUrl = type === 'confirm'
      ? `${PUBLIC_URL}/#confirm-email/${token}`
      : `${PUBLIC_URL}/#reset-password/${token}`
    const subject = type === 'confirm'
      ? 'Confirma tu cuenta - Marketplace UFG'
      : 'Restablece tu contrasena - Marketplace UFG'
    const html = type === 'confirm'
      ? buildConfirmHtml(userName || '', baseUrl)
      : buildResetHtml(userName || '', baseUrl)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Marketplace UFG <onboarding@resend.dev>',
        to: email,
        subject,
        html
      })
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('[send-email] Resend error:', data)
      return new Response(JSON.stringify({ error: 'Error al enviar el correo' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      })
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    })
  } catch (error) {
    console.error('[send-email] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    })
  }
})
