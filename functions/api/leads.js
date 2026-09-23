// functions/api/leads.js
// Requires the same Basic Auth as /admin (see functions/_shared/auth.js).
//
// GET /api/leads            -> JSON array of leads
// GET /api/leads?format=csv -> CSV file download

import { checkAuth } from '../_shared/auth.js';

export async function onRequestGet(context) {
  const authFail = checkAuth(context.request, context.env);
  if (authFail) return authFail;

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
