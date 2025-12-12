import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { GlassCard } from './GlassCard';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook?: string;
  social_instagram?: string;
  social_linkedin?: string;
  stripe_public_key?: string;
  stripe_secret_key?: string;
  maintenance_mode: boolean;
}

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Minha Floresta',
    site_description: 'Compense sua pegada de carbono',
    contact_email: 'contato@minhafloresta.com.br',
    contact_phone: '(11) 99999-9999',
    contact_address: 'São Paulo, SP',
    social_facebook: '',
    social_instagram: '',
    social_linkedin: '',
    stripe_public_key: '',
    stripe_secret_key: '',
    maintenance_mode: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Check if settings exist
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('site_settings')
          .insert([settings]);

        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Configurações do Sistema</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <GlassCard variant="glass" className="p-8 border-white/40">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
            <div className="p-2 bg-emerald-100/50 rounded-lg">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Informações do Site</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Site</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium resize-none"
                rows={3}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.maintenance_mode ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="hidden"
                />
                <div>
                  <span className="text-sm font-bold text-gray-700 block">Modo Manutenção</span>
                  <span className="text-xs text-gray-500 block">Ativar para desabilitar o site temporariamente</span>
                </div>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Contact Information */}
        <GlassCard variant="glass" className="p-8 border-white/40">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
            <div className="p-2 bg-emerald-100/50 rounded-lg">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Informações de Contato</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
          </div>
        </GlassCard>

        {/* Social Media */}
        <GlassCard variant="glass" className="p-8 border-white/40">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
            <div className="p-2 bg-emerald-100/50 rounded-lg">
              <Instagram className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Redes Sociais</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={settings.social_facebook || ''}
                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                value={settings.social_instagram || ''}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </label>
              <input
                type="url"
                value={settings.social_linkedin || ''}
                onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
          </div>
        </GlassCard>

        {/* Payment Settings */}
        <GlassCard variant="glass" className="p-8 border-white/40">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
            <div className="p-2 bg-emerald-100/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Configurações de Pagamento</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stripe Public Key</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">PK</span>
                <input
                  type="text"
                  value={settings.stripe_public_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value })}
                  placeholder="pk_..."
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stripe Secret Key</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">SK</span>
                <input
                  type="password"
                  value={settings.stripe_secret_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                  placeholder="sk_..."
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                Mantenha esta chave em segredo absoluto.
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-full mt-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Atenção</p>
                  <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                    As chaves do Stripe definem se o sistema opera em modo de teste ou produção.
                    Verifique se está usando as chaves corretas para o ambiente desejado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Save Button (Mobile) */}
      <div className="lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
