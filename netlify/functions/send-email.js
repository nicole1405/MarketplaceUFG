/**
 * Netlify Function: send-email
 * Envía correos usando Resend API.
 * Soporta: 'reset' (reset de contraseña) y 'confirm' (confirmación de email)
 * 
 * Variables de entorno requeridas:
 *   RESEND_API_KEY - API key de Resend
 *   PUBLIC_URL - URL del sitio
 */

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { email, token, type, userName } = await req.json();

        if (!email || !token || !type) {
            return new Response(JSON.stringify({ error: 'email, token y type requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const RESEND_API_KEY = Netlify.env.get('RESEND_API_KEY');
        const PUBLIC_URL = Netlify.env.get('PUBLIC_URL') || 'https://marketplace-ufg.netlify.app';

        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: 'Email service not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let subject, html;

        if (type === 'confirm') {
            const confirmUrl = `${PUBLIC_URL}/#confirm-email/${token}`;
            subject = 'Confirmá tu cuenta - Marketplace UFG';
            html = buildConfirmEmailHtml(userName, confirmUrl);
        } else {
            const resetUrl = `${PUBLIC_URL}/#reset-password/${token}`;
            subject = 'Restablecé tu contraseña - Marketplace UFG';
            html = buildResetEmailHtml(userName, resetUrl);
        }

        const response = await fetch('https://api.resend.com/emails', {
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
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[send-email] Resend error (${type}):`, data);
            return new Response(JSON.stringify({ error: 'Error al enviar el correo' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[send-email] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

function buildConfirmEmailHtml(userName, confirmUrl) {
    const name = userName ? ` ${userName}` : '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#1976D2 0%,#0D47A1 100%);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0}
        .content{background:#f9f9f9;padding:30px}
        .button{display:inline-block;background:#1976D2;color:#fff;padding:14px 35px;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:600;font-size:16px}
        .footer{background:#eee;padding:20px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px}
        .warning{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px}
    </style></head><body>
    <div class="container">
        <div class="header"><h1>🎓 Marketplace UFG</h1><p>Confirmá tu cuenta</p></div>
        <div class="content">
            <h2>¡Hola${name}!</h2>
            <p>Gracias por registrarte en <strong>Marketplace UFG</strong>.</p>
            <p>Hacé clic en el botón para confirmar tu cuenta:</p>
            <p style="text-align:center;"><a href="${confirmUrl}" class="button">Confirmar mi cuenta</a></p>
            <p><small>Si el botón no funciona, copiá y pegá:<br>${confirmUrl}</small></p>
            <div class="warning"><strong>⚠️ Importante:</strong> Este enlace expira en 1 hora.</div>
            <p>¡Bienvenido a la comunidad!</p>
            <p>— El equipo de Marketplace UFG</p>
        </div>
        <div class="footer"><p>Universidad Francisco Gavidia</p></div>
    </div>
    </body></html>`;
}

function buildResetEmailHtml(userName, resetUrl) {
    const name = userName ? ` ${userName}` : '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#1976D2 0%,#0D47A1 100%);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0}
        .content{background:#f9f9f9;padding:30px}
        .button{display:inline-block;background:#1976D2;color:#fff;padding:14px 35px;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:600;font-size:16px}
        .footer{background:#eee;padding:20px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px}
        .warning{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px}
    </style></head><body>
    <div class="container">
        <div class="header"><h1>🎓 Marketplace UFG</h1><p>Restablecé tu contraseña</p></div>
        <div class="content">
            <h2>¡Hola${name}!</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p style="text-align:center;"><a href="${resetUrl}" class="button">Restablecer Contraseña</a></p>
            <p><small>${resetUrl}</small></p>
            <div class="warning"><strong>⚠️ Importante:</strong> Este enlace expira en 1 hora.</div>
            <p>— El equipo de Marketplace UFG</p>
        </div>
        <div class="footer"><p>Universidad Francisco Gavidia</p></div>
    </div>
    </body></html>`;
}
