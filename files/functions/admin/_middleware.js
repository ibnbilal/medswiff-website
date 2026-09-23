// functions/admin/_middleware.js
// Applies to every request under /admin/* — including the static admin/index.html.
import { checkAuth } from '../_shared/auth.js';

export async function onRequest(context) {
  const authFail = checkAuth(context.request, context.env);
  if (authFail) return authFail;
  return context.next();
}
