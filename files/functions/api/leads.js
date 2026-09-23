// functions/api/leads.js
// Returns stored leads. Protect this path with Cloudflare Access (see deploy steps) —
// this function does not do its own authentication.
//
// GET /api/leads          -> JSON array of leads
// GET /api/leads?format=csv -> CSV file download

export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const format = url.searchParams.get('format');

  const { results } = await db
    .prepare(
      `SELECT id, name, email, clinic, practice_type, current_system, bottleneck, created_at
       FROM demo_requests
       ORDER BY created_at DESC`
    )
    .all();

  if (format === 'csv') {
    const header = ['id', 'name', 'email', 'clinic', 'practice_type', 'current_system', 'bottleneck', 'created_at'];
    const rows = results.map((r) => header.map((h) => csvEscape(r[h])).join(','));
    const csv = [header.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="medswiff-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
