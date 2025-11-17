import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2, Mail, Lock, User, Phone, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
// removed apiRequest prewarm to avoid offline banner

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'recover';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    cpf: '',
    address: ''
  });

  const { login, register, isLoading, resetPassword } = useAuth();
  const { setCurrentPage } = useApp();

  // Prevent body scroll when modal is open and handle escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // removed pre-warm health ping to avoid triggering offline mode banners

  useEffect(() => {
    if (!isLoading) {
      setShowSlowHint(false);
      return;
    }
    const t = setTimeout(() => setShowSlowHint(true), 4000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'recover') {
      if (!formData.email) {
        toast.error('Preencha o email');
        return;
      }
      try {
        const res = await resetPassword(formData.email);
        if (!res.success) {
          toast.error(res.error || 'Erro ao enviar email de recuperação');
          return;
        }
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
        return;
      } catch (error) {
        return;
      }
    }

    if (!formData.email || !formData.password) {
      toast.error('Preencha email e senha');
      return;
    }

    if (mode === 'register' && !formData.name) {
      toast.error('Preencha o nome completo');
      return;
    }

    try {
      if (mode === 'login') {
        const res = await login({
          email: formData.email,
          password: formData.password
        });
        if (!res.success) {
          toast.error(res.error || 'Falha no login');
          return;
        }
        toast.success('Login realizado com sucesso!');
        setCurrentPage('dashboard');
        handleClose();
        // Reset form
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          cpf: '',
          address: ''
        });
      } else {
        const res = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf
        });
        if (!res.success) {
          toast.error(res.error || 'Falha ao criar conta');
          return;
        }
        toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
        toast.info('Enviamos um e-mail de confirmação. Confira sua caixa de entrada e spam.');
        setMode('login');
        // Keep email, clear password and optional fields for login
        setFormData(prev => ({
          ...prev,
          password: '',
          name: '',
          phone: '',
          cpf: '',
          address: ''
        }));
      }
    } catch (error) {
      // Error is already handled in auth context
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
      style={{ margin: 0, padding: '1rem' }}
    >
      <div className="relative w-full max-w-md mx-auto my-8">
        <div className={`bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl transform-gpu ${
          isClosing ? 'modal-exit' : 'animate-scale-up'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {mode === 'login' ? 'Entrar na sua conta' : mode === 'register' ? 'Criar nova conta' : 'Recuperar senha'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          {/* Phone (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone (opcional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                placeholder="(11) 99999-9999"
              />
            </div>
          )}

          {/* CPF (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                CPF (opcional)
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                placeholder="000.000.000-00"
              />
            </div>
          )}

          {/* Address (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Endereço (opcional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                placeholder="Rua, Número - Cidade, Estado"
              />
            </div>
          )}

          {/* Password (Login and Register only) */}
          {mode !== 'recover' && (
          <div>
            <label className="block text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all pr-12"
                placeholder="Digite sua senha"
                required
                minLength={6}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-md transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            )}
          </div>
          )}

          {/* Recovery message */}
          {mode === 'recover' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('recover')}
                className="text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Enviar Link de Recuperação'
            )}
          </button>

          {isLoading && showSlowHint && (
            <div className="text-center text-xs text-gray-500 pt-2">
              Servidor está lento, continuando a tentativa...
            </div>
          )}

          {/* Mode Switch */}
          <div className="text-center pt-4 border-t border-white/20">
            <p className="text-gray-600 text-sm">
              {mode === 'login' ? 'Não tem uma conta?' : mode === 'register' ? 'Já tem uma conta?' : 'Lembrou a senha?'}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-2 text-green-600 hover:text-green-700 font-medium"
              >
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}