// functions/api/demo.js
// Handles demo form submissions:
// - validates input
// - blocks duplicate submissions from the same email within 24 hours
// - writes to D1
// - fires an email alert (Resend) without blocking the response

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, clinic, type, system, bottleneck } = data || {};

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !clinic || !type || !bottleneck || !emailRe.test(email || '')) {
      return json({ error: 'Missing or invalid fields' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = context.env.DB;

    // Duplicate-submission prevention: same email within the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const existing = await db
      .prepare(`SELECT id FROM demo_requests WHERE email = ? AND created_at > ? LIMIT 1`)
      .bind(cleanEmail, since)
      .first();

    if (existing) {
      return json(
        {
          error: 'duplicate',
          message: "We already have a request from this email in the last 24 hours — we'll be in touch soon.",
        },
        409
      );
    }

    const createdAt = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO demo_requests (name, email, clinic, practice_type, current_system, bottleneck, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(name.trim(), cleanEmail, clinic.trim(), type, system ? system.trim() : null, bottleneck, createdAt)
      .run();

    // Fire-and-forget: an email failure should never fail the user's submission
    context.waitUntil(
      sendAlertEmail(context.env, {
        name: name.trim(),
        email: cleanEmail,
        clinic: clinic.trim(),
        type,
        system,
        bottleneck,
        createdAt,
      })
    );

    return json({ success: true }, 200);
  } catch (err) {
    return json({ error: 'Server error' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}

async function sendAlertEmail(env, lead) {
  if (!env.RESEND_API_KEY || !env.ALERT_EMAIL_TO) return;

  const fromAddress = env.ALERT_EMAIL_FROM || 'onboarding@resend.dev';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: env.ALERT_EMAIL_TO,
        subject: `New MedSwiff demo request — ${lead.clinic}`,
        text:
          `New demo request:\n\n` +
          `Name: ${lead.name}\n` +
          `Email: ${lead.email}\n` +
          `Clinic: ${lead.clinic}\n` +
          `Practice type: ${lead.type}\n` +
          `Current system: ${lead.system || '—'}\n` +
          `Bottleneck: ${lead.bottleneck}\n` +
          `Submitted: ${lead.createdAt}`,
      }),
    });
  } catch (err) {
    // Swallow — the lead is already saved; an alert failure shouldn't surface to the user
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
