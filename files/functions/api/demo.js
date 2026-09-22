// functions/api/demo.js
// Cloudflare Pages Function — receives the demo form POST and writes it to D1.
// Requires a D1 binding named "DB" on this Pages project (see setup steps).

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, clinic, type, system, bottleneck } = data || {};

    // Basic server-side validation — mirrors the client-side checks
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !clinic || !type || !bottleneck || !emailRe.test(email || '')) {
      return json({ error: 'Missing or invalid fields' }, 400);
    }

    await context.env.DB.prepare(
      `INSERT INTO demo_requests (name, email, clinic, practice_type, current_system, bottleneck, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        name.trim(),
        email.trim(),
        clinic.trim(),
        type,
        system ? system.trim() : null,
        bottleneck,
        new Date().toISOString()
      )
      .run();

    return json({ success: true }, 200);
  } catch (err) {
    return json({ error: 'Server error' }, 500);
  }
}

// Reject non-POST methods explicitly
export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
