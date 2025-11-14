import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Upload, Activity } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

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
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    long_description: '',
    goal_amount: 0,
    current_amount: 0,
    image_url: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const handleAdd = () => {
    setEditingDonation(null);
    setFormData({
      title: '',
      description: '',
      long_description: '',
      goal_amount: 0,
      current_amount: 0,
      image_url: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
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
      end_date: donation.end_date || ''
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Imagem muito grande! Máximo 5MB');
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `donation-${Date.now()}.${fileExt}`;
      const filePath = `donations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDonation) {
        const { error } = await supabase
          .from('donation_projects')
          .update(formData)
          .eq('id', editingDonation.id);

        if (error) throw error;
        toast.success('Projeto de doação atualizado!');
      } else {
        const { error } = await supabase
          .from('donation_projects')
          .insert([formData]);

        if (error) throw error;
        toast.success('Projeto de doação criado!');
      }

      setShowModal(false);
      onReload();
    } catch (error: any) {
      console.error('Error saving donation:', error);
      toast.error('Erro ao salvar projeto de doação');
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
          <div className="col-span-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-12 text-center shadow-xl">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum projeto de doação cadastrado</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div
              key={donation.id}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all"
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
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  donation.status === 'active' ? 'bg-green-100 text-green-700' :
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
            </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-32 h-32 rounded-xl object-cover" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Escolher Imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingDonation ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
