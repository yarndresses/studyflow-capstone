import type { Session } from '@supabase/supabase-js';

const apiBaseUrl = (import.meta.env.VITE_NEON_API_BASE_URL ?? '').replace(/\/$/, '');

export type ApiResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function apiRequest<T>(session: Session, path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  if (!apiBaseUrl) return { data: null, error: { message: 'StudyFlow API is not configured.' } };

  try {
    const response = await fetch(`${apiBaseUrl}/${path.replace(/^\//, '')}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      return { data: null, error: { message: payload?.error ?? `Request failed (${response.status}).` } };
    }
    if (response.status === 204) return { data: null, error: null };
    return { data: await response.json() as T, error: null };
  } catch {
    return { data: null, error: { message: 'Could not reach the StudyFlow API.' } };
  }
}