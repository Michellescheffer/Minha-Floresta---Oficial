import { useState, useEffect } from 'react';
import { UserAPI, type User } from '../services/api';
import { setLocalStorageItem } from '../utils/database';
import { supabase } from '../services/supabaseClient';

export interface AuthUser extends User {
  // Additional frontend-specific properties can be added here
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.user) {
          const u = session.user;
          const base: User = {
            id: u.id,
            email: u.email || '',
            name: (u.user_metadata?.name as string) || (u.email?.split('@')[0] || 'Usuário'),
            created_at: new Date().toISOString(),
            role: 'user',
            preferences: { newsletter: false, notifications: false }
          } as User;
          setLocalStorageItem('minha_floresta_user', base);
          setUser(base as AuthUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        const msg = authError?.message || 'Falha no login';
        setError(msg);
        return { success: false, error: msg };
      }

      const u = authData.user;
      // Enforce email confirmation before allowing login
      const confirmed = Boolean((u as any).email_confirmed_at);
      if (!confirmed) {
        await supabase.auth.signOut();
        // Try resend confirmation
        try { await supabase.auth.resend({ type: 'signup', email }); } catch {}
        const msg = 'Confirme seu email para entrar. Reenviei o link para sua caixa de entrada.';
        setError(msg);
        return { success: false, error: msg };
      }

      const base: User = {
        id: u.id,
        email: u.email || email,
        name: (u.user_metadata?.name as string) || (u.email?.split('@')[0] || 'Usuário'),
        created_at: new Date().toISOString(),
        role: 'user',
        preferences: { newsletter: false, notifications: false }
      } as User;
      setLocalStorageItem('minha_floresta_user', base);
      setUser(base as AuthUser);
      return { success: true, user: base };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name, phone: userData.phone, cpf: userData.cpf },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError || !authData.user) {
        const msg = authError?.message || 'Falha ao criar conta';
        setError(msg);
        return { success: false, error: msg };
      }

      // Do not auto-login on sign up; require email confirmation
      try { await supabase.auth.signOut(); } catch {}
      return { success: true, user: {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        created_at: new Date().toISOString(),
        role: 'user',
        preferences: { newsletter: false, notifications: false }
      } as any };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no cadastro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    UserAPI.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: apiError } = await UserAPI.updateProfile(user.id, updates);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data) {
        setUser(data);
        return { success: true, user: data };
      }

      return { success: false, error: 'Erro ao atualizar perfil' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        const msg = resetError.message || 'Erro ao enviar email de recuperação';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recuperar senha';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword
  };
}