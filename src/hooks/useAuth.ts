import { useState, useEffect } from 'react';
import { UserAPI, type User } from '../services/api';

export interface AuthUser extends User {
  // Additional frontend-specific properties can be added here
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = UserAPI.getCurrentUser();
    const savedToken = UserAPI.getAuthToken();
    
    if (savedUser && savedToken) {
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: apiError } = await UserAPI.login(email, password);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data) {
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Erro desconhecido no login' };
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

      const { data, error: apiError } = await UserAPI.register(userData);

      if (apiError) {
        setError(apiError);
        return { success: false, error: apiError };
      }

      if (data) {
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Erro desconhecido no cadastro' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no cadastro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };
}