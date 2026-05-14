/**
 * Netlify Function: send-reset-email
 * Envía correos de reset de contraseña usando Resend.
 * 
 * Variables de entorno requeridas en Netlify:
 *   RESEND_API_KEY - API key de Resend
 *   PUBLIC_URL - URL del sitio (ej: https://marketplace-ufg.netlify.app)
 */

export default async (req) => {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { email, token, userName } = await req.json();

        if (!email || !token) {
            return new Response(JSON.stringify({ error: 'Email y token requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const PUBLIC_URL = process.env.PUBLIC_URL || 'https://marketplace-ufg.netlify.app';

        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: 'Resend API key no configurada' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const resetUrl = `${PUBLIC_URL}/#reset-password/${token}`;

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .button { display: inline-block; background: #1976D2; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 16px; }
                .footer { background: #eee; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Marketplace UFG</h1>
                    <p>Restablecé tu contraseña</p>
                </div>
                <div class="content">
                    <h2>¡Hola${userName ? ` ${userName}` : ''}!</h2>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Marketplace UFG</strong>.</p>
                    <p>Hacé clic en el siguiente botón para crear una nueva contraseña:</p>
                    <p style="text-align: center;">
                        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                    </p>
                    <p><small>Si el botón no funciona, copiá y pegá este enlace en tu navegador:</small></p>
                    <p><small style="word-break: break-all; color: #1976D2;">${resetUrl}</small></p>
                    <div class="warning">
                        <strong>⚠️ Importante:</strong> Este enlace expira en 1 hora. Si no solicitaste este cambio, ignorá este correo.
                    </div>
                    <p>— El equipo de Marketplace UFG</p>
                </div>
                <div class="footer">
                    <p>Universidad Francisco Gavidia | San Salvador, El Salvador</p>
                </div>
            </div>
        </body>
        </html>`;

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Marketplace UFG <onboarding@resend.dev>',
                to: email,
                subject: 'Restablecé tu contraseña - Marketplace UFG',
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[send-reset-email] Resend error:', data);
            return new Response(JSON.stringify({ error: data.message || 'Error al enviar correo' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[send-reset-email] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
