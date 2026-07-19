// IceBrk auth intentionally never collects email. Hosts sign up with just a
// username and password. Supabase Auth still needs *something* email-shaped
// under the hood, so we derive a synthetic, never-emailed address from the
// username and store the real username in user_metadata.
//
// IMPORTANT: this only works if "Confirm email" is turned OFF for the Email
// provider in the Supabase dashboard (Authentication → Providers → Email).
// With it on, Supabase would try to mail a confirmation link to the fake
// address and the signup could never be completed.
const FAKE_EMAIL_DOMAIN = 'accounts.icebrk.internal'

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
export const USERNAME_HINT = '3-20 characters: letters, numbers, and underscores only'

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function usernameToEmail(rawUsername: string): string {
  return `${normalizeUsername(rawUsername)}@${FAKE_EMAIL_DOMAIN}`
}

/** Supabase error/status text talks about "email", reword it to "username" for this app's UI. */
export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'That username is already taken. Try logging in instead.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect username or password.'
  }
  if (lower.includes('password')) {
    return message
  }
  return message.replace(/email/gi, 'username')
}
