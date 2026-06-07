import type { AuthError } from '@supabase/supabase-js';

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email or password is incorrect',
  'Email not confirmed': 'Please verify your email before signing in',
  'Email not verified': 'Please verify your email before signing in',
  'User already registered': 'An account with this email already exists',
  'Email address already registered': 'An account with this email already exists',
  'User not found': 'No account found with this email',
  'Password should be at least 6 characters': 'Password must be at least 6 characters',
  'New password should be different from the old password': 'Your new password must be different from your current password',
  'Token has expired or is invalid': 'This code has expired. Please request a new one.',
  'Email link is invalid or has expired': 'This link has expired. Please request a new one.',
  'Unable to validate email address': 'Please enter a valid email address',
  'Signup requires a valid password': 'Please enter a valid password',
};

export function getAuthErrorMessage(error: AuthError | null): string | null {
  if (!error) return null;

  const msg = error.message;

  // Match exact messages first
  if (ERROR_MESSAGES[msg]) {
    return ERROR_MESSAGES[msg];
  }

  // Check for partial matches (Supabase sometimes prefixes with "AuthApiError: ")
  const cleanMsg = msg.replace(/^AuthApiError:\s*/, '');
  if (ERROR_MESSAGES[cleanMsg]) {
    return ERROR_MESSAGES[cleanMsg];
  }

  // Rate limit detection
  const lower = msg.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('request has been rate limited')) {
    return 'Too many attempts. Please try again later.';
  }

  // OTP/Token errors
  if (lower.includes('invalid token') || lower.includes('token is invalid') || lower.includes('otp')) {
    return 'Invalid code. Please check and try again.';
  }

  // Network errors
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Fallback: return original message if we don't have a mapping
  // But clean up common prefixes
  if (cleanMsg !== msg) {
    return cleanMsg;
  }

  return msg;
}

export function isEmailNotConfirmed(error: AuthError | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('email') && (msg.includes('confirm') || msg.includes('verified'));
}
