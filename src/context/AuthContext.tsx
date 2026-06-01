import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: string | null; needsConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, nickname: string): Promise<{ error: string | null; needsConfirm?: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });
    if (error) return { error: friendlyError(error.message) };
    // 이메일 확인이 켜진 경우 session이 null로 옴
    if (data.session === null) return { error: null, needsConfirm: true };
    return { error: null, needsConfirm: false };
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyError(error.message) };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/* Supabase 에러 메시지 → 한국어 */
function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials'))  return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (msg.includes('User already registered'))    return '이미 가입된 이메일이에요. 로그인을 시도해보세요.';
  if (msg.includes('Email not confirmed'))        return '이메일 인증이 필요해요. 받은 메일함을 확인해주세요.';
  if (msg.includes('Password should be'))         return '비밀번호는 6자 이상이어야 해요.';
  if (msg.includes('Unable to validate'))         return '잠시 후 다시 시도해주세요.';
  return msg;
}
