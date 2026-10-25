import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, ApiError } from '@/lib/http';
import type { User } from '@/lib/types';
import { getRefreshToken, loadSession, onSessionChange, setSession, type TokenResponse } from './session';
import type { SocialToken } from './social';

type Status = 'loading' | 'guest' | 'authed';

/** Новий користувач соцвходу ще має обрати роль — див. completeSignup. */
export type SignupRequired = { email: string | null; name: string; signupToken: string };
export type SocialResult = { status: 'ok' } | ({ status: 'signup_required' } & SignupRequired);

type Auth = {
  status: Status;
  user: User | null;
  signIn: (login: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; ageConfirm: boolean }) => Promise<void>;
  signInWithSocial: (token: NonNullable<SocialToken>) => Promise<SocialResult>;
  completeSignup: (input: { signupToken: string; role: 'parent' | 'student'; name: string; ageConfirm?: boolean; birthYear?: number }) => Promise<void>;
  signOut: () => Promise<void>;
  /** Видаляє акаунт на сервері назавжди; помилку (напр. платіжка не скасувала списання) кидає далі. */
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: Status; user: User | null }>({ status: 'loading', user: null });

  // Старт: якщо в сховищі є сесія — підтягуємо профіль
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadSession();
      if (!getRefreshToken()) return alive && setState({ status: 'guest', user: null });
      try {
        const { user } = await apiRequest<{ user: User }>('/me', { auth: 'required' });
        if (alive) setState({ status: 'authed', user });
      } catch {
        // Немає мережі — сесію не скидаємо, користувач побачить додаток як гість
        if (alive) setState({ status: 'guest', user: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Сервер завершив сесію (refresh відкликано) — переходимо в гостьовий режим
  useEffect(() => onSessionChange((signedIn) => !signedIn && setState({ status: 'guest', user: null })), []);

  const accept = useCallback(async (res: TokenResponse) => {
    await setSession(res);
    setState({ status: 'authed', user: res.user });
  }, []);

  const value = useMemo<Auth>(
    () => ({
      ...state,
      signIn: async (login, password) => accept(await apiRequest<TokenResponse>('/auth/login', { method: 'POST', body: { login, password } })),
      register: async (input) => accept(await apiRequest<TokenResponse>('/auth/register', { method: 'POST', body: input })),
      signInWithSocial: async (token) => {
        const { provider, ...credentials } = token;
        const res = await apiRequest<({ status: 'ok' } & TokenResponse) | ({ status: 'signup_required' } & SignupRequired)>(`/auth/${provider}`, {
          method: 'POST',
          body: credentials,
        });
        if (res.status === 'signup_required') return res;
        await accept(res);
        return { status: 'ok' };
      },
      completeSignup: async (input) => accept(await apiRequest<TokenResponse>('/auth/signup/complete', { method: 'POST', body: input })),
      deleteAccount: async () => {
        await apiRequest('/account/delete', { method: 'POST', body: { confirm: true }, auth: 'required' });
        // Сервер уже відкликав усі сесії — лишається прибрати токени з пристрою
        await setSession(null);
        setState({ status: 'guest', user: null });
      },
      signOut: async () => {
        const refreshToken = getRefreshToken();
        // Спершу очищаємо локально — вихід має спрацювати навіть без мережі
        await setSession(null);
        setState({ status: 'guest', user: null });
        if (refreshToken) await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {});
      },
    }),
    [state, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth має викликатися всередині AuthProvider');
  return ctx;
}

export { ApiError };
