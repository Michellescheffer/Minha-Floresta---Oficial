import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Activity } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { ImageUploadWithResizer } from './ImageUploadWithResizer';
import { GlassCard } from './GlassCard';
import { cmsTokens } from './cms/constants';

interface Donation {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  goal_amount: number;
  current_amount: number;
  image_url?: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  created_at: string;
}

interface SocialProjectsTabProps {
  donations: Donation[];
  onReload: () => void;
}

export function SocialProjectsTab({ donations, onReload }: SocialProjectsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = {
    title: '',
    description: '',
    long_description: '',
    goal_amount: 0,
    current_amount: 0,
    image_url: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    gallery_images: [] as string[]
  };
  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);

  const handleAdd = () => {
    setEditingDonation(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      title: donation.title,
      description: donation.description,
      long_description: donation.long_description || '',
      goal_amount: donation.goal_amount,
      current_amount: donation.current_amount,
      image_url: donation.image_url || '',
      status: donation.status,
      start_date: donation.start_date,
      end_date: donation.end_date || '',
      gallery_images: donation.image_url ? [donation.image_url] : []
    });
    setShowModal(true);
  };

  const uploadBase64Image = async (base64Image: string, index: number) => {
    try {
      const response = await fetch(base64Image);
      const blob = await response.blob();
      const contentType = blob.type || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      const fileName = `donation-${Date.now()}-${index}.${extension}`;
      const filePath = `donations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, { contentType });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      throw error;
    }
  };

  const processGalleryImages = async () => {
    const uploadedImages: string[] = [];

    for (const [index, image] of formData.gallery_images.entries()) {
      if (!image) continue;
      if (image.startsWith('http')) {
        uploadedImages.push(image);
        continue;
      }

      if (image.startsWith('data:')) {
        const publicUrl = await uploadBase64Image(image, index);
        uploadedImages.push(publicUrl);
      }
    }

    return uploadedImages;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Informe o título do projeto');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Adicione uma descrição curta');
      return false;
    }
    if (formData.goal_amount <= 0) {
      toast.error('Meta deve ser maior que zero');
      return false;
    }
    if (formData.current_amount < 0) {
      toast.error('Valor arrecadado não pode ser negativo');
      return false;
    }
    if (!formData.start_date) {
      toast.error('Defina a data de início');
      return false;
    }
    if (formData.gallery_images.length === 0) {
      toast.error('Adicione pelo menos uma imagem do projeto');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      const galleryImages = await processGalleryImages();

      if (galleryImages.length === 0) {
        toast.error('Não foi possível processar as imagens do projeto');
        setSaving(false);
        return;
      }

      const coverImage = galleryImages[0];
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        // long_description: formData.long_description.trim(), // Removed to avoid schema mismatch
        goal_amount: Number(formData.goal_amount),
        current_amount: Number(formData.current_amount),
        image_url: coverImage,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || null
      };

      if (editingDonation) {
        const { error } = await supabase
          .from('donation_projects')
          .update(payload)
          .eq('id', editingDonation.id);

        if (error) throw error;
        toast.success('Projeto social atualizado!');
      } else {
        const { error } = await supabase
          .from('donation_projects')
          .insert([payload]);

        if (error) throw error;
        toast.success('Projeto social criado!');
      }

      setShowModal(false);
      setEditingDonation(null);
      setFormData(emptyForm);
      onReload();
    } catch (error: any) {
      console.error('Error saving donation:', error);
      toast.error('Erro ao salvar projeto social');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto social?')) return;

    try {
      const { error } = await supabase
        .from('donation_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projeto social excluído!');
      onReload();
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Projetos Sociais ({donations.length})</h2>
        <button
          onClick={handleAdd}
          className={cmsTokens.button.primary + " flex items-center gap-2"}
        >
          <Plus className="w-4 h-4" />
          Novo Projeto Social
        </button>
      </div>

      {/* Donations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donations.length === 0 ? (
          <GlassCard variant="solid" className="col-span-2 p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum projeto social cadastrado</p>
          </GlassCard>
        ) : (
          donations.map((donation) => (
            <GlassCard
              key={donation.id}
              variant="solid"
              hoverEffect
              className="group"
            >
              {donation.image_url && (
                <img
                  src={donation.image_url}
                  alt={donation.title}
                  className="w-full h-48 rounded-xl object-cover mb-4"
                />
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{donation.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{donation.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${donation.status === 'active' ? 'bg-green-100 text-green-700' :
                  donation.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {donation.status === 'active' ? 'Ativo' :
                    donation.status === 'completed' ? 'Concluído' : 'Pausado'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Arrecadado</span>
                  <span className="font-semibold">
                    R$ {donation.current_amount.toLocaleString('pt-BR')} / R$ {donation.goal_amount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${getProgress(donation.current_amount, donation.goal_amount)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getProgress(donation.current_amount, donation.goal_amount).toFixed(1)}% da meta
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(donation)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(donation.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal - Liquid Glass Style */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 bg-white shadow-2xl rounded-[2rem] ring-1 ring-black/5 overflow-hidden">

            {/* Decorative Gradients (Subtler) */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100/50 flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-700">
                  {editingDonation ? 'Editar Projeto Social' : 'Novo Projeto Social'}
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Preencha os detalhes da campanha de doação.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="space-y-8">
                  <div className="glass-panel space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold pb-2 border-b border-emerald-100/50">
                      <Activity className="w-5 h-5" />
                      <span>Informações Principais</span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Título</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                          placeholder="Ex: Doação de Mudas Nativas"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Descrição Curta</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px] resize-none"
                          placeholder="Um resumo breve para o card do projeto..."
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Descrição Completa</label>
                        <textarea
                          value={formData.long_description}
                          onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[150px] resize-none"
                          placeholder="Detalhes completos sobre o impacto e objetivos..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold pb-2 border-b border-emerald-100/50">
                      <Activity className="w-5 h-5" />
                      <span>Metas e Valores</span>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Meta (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.goal_amount}
                            onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Arrecadado</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.current_amount}
                            onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className="glass-panel space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold pb-2 border-b border-emerald-100/50">
                      <Activity className="w-5 h-5" />
                      <span>Configurações</span>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">Data Início</label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">Data Fim</label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                        >
                          <option value="active">Ativo (Visível)</option>
                          <option value="paused">Pausado</option>
                          <option value="completed">Concluído</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold pb-2 border-b border-emerald-100/50">
                      <Activity className="w-5 h-5" />
                      <span>Imagem de Capa</span>
                    </div>

                    <div className="bg-white/40 p-6 rounded-3xl border border-white/50 border-dashed backdrop-blur-sm shadow-inner transition-all hover:bg-white/50">
                      <ImageUploadWithResizer
                        images={formData.gallery_images}
                        onChange={(images) => setFormData((prev) => ({
                          ...prev,
                          gallery_images: images,
                          image_url: images[0] || prev.image_url
                        }))}
                        maxImages={5}
                        maxFileSize={5}
                      />
                      <p className="text-xs text-center text-gray-500 mt-3">A primeira imagem será usada como capa.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className={cmsTokens.button.primary + " w-full flex items-center justify-center gap-2"}
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Processando...' : editingDonation ? 'Salvar Alterações' : 'Criar Projeto'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={cmsTokens.button.secondary + " w-full"}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
