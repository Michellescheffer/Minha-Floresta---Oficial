import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Activity } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { ImageUploadWithResizer } from './ImageUploadWithResizer';
import { GlassCard } from './GlassCard';

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

interface DonationsTabProps {
  donations: Donation[];
  onReload: () => void;
}

export function DonationsTab({ donations, onReload }: DonationsTabProps) {
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
        long_description: formData.long_description.trim(),
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
        toast.success('Projeto de doação atualizado!');
      } else {
        const { error } = await supabase
          .from('donation_projects')
          .insert([payload]);

        if (error) throw error;
        toast.success('Projeto de doação criado!');
      }

      setShowModal(false);
      setEditingDonation(null);
      setFormData(emptyForm);
      onReload();
    } catch (error: any) {
      console.error('Error saving donation:', error);
      toast.error('Erro ao salvar projeto de doação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto de doação?')) return;

    try {
      const { error } = await supabase
        .from('donation_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projeto de doação excluído!');
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
        <h2 className="text-xl font-bold text-gray-900">Projetos de Doação ({donations.length})</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Donations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donations.length === 0 ? (
          <GlassCard variant="solid" className="col-span-2 p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum projeto de doação cadastrado</p>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(donation.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDonation ? 'Editar Projeto' : 'Novo Projeto de Doação'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição Curta</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes Completos</label>
                <textarea
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arrecadado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim (opcional)</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>

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

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : editingDonation ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
