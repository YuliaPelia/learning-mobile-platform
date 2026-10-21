import { API_URL } from '@/lib/config';
import { getAccessToken } from '@/lib/auth/session';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type Options = {
  method?: 'GET' | 'POST';
  body?: unknown;
  /** none — без токена; optional — з токеном, якщо користувач увійшов; required — потрібен вхід. */
  auth?: 'none' | 'optional' | 'required';
};

const NETWORK_ERROR = 'Немає зʼєднання із сервером. Перевірте інтернет і спробуйте ще раз.';

async function send(path: string, { method = 'GET', body, auth = 'none' }: Options, token: string | null) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token && auth !== 'none') headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${API_URL}/api/mobile/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'network', NETWORK_ERROR);
  }
}

/** Запит до мобільного API. Якщо access-токен прострочився, один раз оновлює його й повторює запит. */
export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  const auth = options.auth ?? 'none';
  let token = auth === 'none' ? null : await getAccessToken();
  if (auth === 'required' && !token) throw new ApiError(401, 'unauthorized', 'Потрібен вхід');

  let res = await send(path, options, token);
  if (res.status === 401 && token) {
    token = await getAccessToken(true);
    // Сесію скасовано: для optional-запитів продовжуємо як гість
    if (token || auth === 'optional') res = await send(path, options, token);
  }

  if (res.status === 204) return undefined as T;
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? 'unknown', err?.message ?? 'Щось пішло не так. Спробуйте ще раз.');
  }
  return json as T;
}
