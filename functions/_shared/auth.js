// functions/_shared/auth.js
// Simple HTTP Basic Auth check — no Zero Trust, no domain, no third-party service.
// Set ADMIN_USER and ADMIN_PASSWORD as environment variables in Pages settings.

export function checkAuth(request, env) {
  const expectedUser = env.ADMIN_USER;
  const expectedPass = env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new Response('Admin auth not configured — set ADMIN_USER and ADMIN_PASSWORD', { status: 500 });
  }

  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Basic ')) {
    return unauthorized();
  }

  let decoded;
  try {
    decoded = atob(auth.slice(6));
  } catch (e) {
    return unauthorized();
  }

  const sep = decoded.indexOf(':');
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  if (user !== expectedUser || pass !== expectedPass) {
    return unauthorized();
  }

  return null; // auth ok
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="MedSwiff Admin"' },
  });
}
