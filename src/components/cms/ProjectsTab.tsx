import React, { useState } from 'react';
import { RefreshCw, Save, X, Plus, MapPin, Tag, DollarSign, Ruler, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../services/supabaseClient';
import { ImageUploadWithResizer } from '../ImageUploadWithResizer';
import { cmsTokens } from './constants';
import { Project } from './types';
import { GlassCard } from '../GlassCard';

const FORM_SECTIONS = [
    {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Título, descrição curta e narrativa completa do projeto.',
        icon: Tag
    },
    {
        id: 'geo',
        title: 'Localização & Categoria',
        description: 'Defina onde o projeto acontece e o tipo de impacto.',
        icon: MapPin
    },
    {
        id: 'metrics',
        title: 'Metas e Métricas',
        description: 'Preço por metro quadrado e disponibilidade da área.',
        icon: Ruler
    },
    {
        id: 'media',
        title: 'Biblioteca Visual',
        description: 'Faça upload das imagens que representam o projeto.',
        icon: ImageIcon
    },
];

interface ProjectsTabProps {
    projects: Project[];
    onDelete: (id: string) => void;
    onReload: () => Promise<void>;
}

export function ProjectsTab({ projects, onDelete, onReload }: ProjectsTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const emptyForm = {
        name: '',
        description: '',
        long_description: '',
        location: '',
        type: 'conservation',
        price_per_sqm: 0,
        available_area: 0,
        total_area: 0,
        status: 'active',
        image: '',
        gallery_images: [] as string[]
    };
    const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description,
            long_description: project.long_description || '',
            location: project.location,
            type: project.type,
            price_per_sqm: project.price_per_sqm,
            available_area: project.available_area,
            total_area: project.total_area,
            status: project.status,
            image: project.image || project.image_url || '',
            gallery_images: Array.isArray(project.gallery_images) ? project.gallery_images : []
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingProject(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const uploadBase64Image = async (base64Image: string, index: number) => {
        try {
            const response = await fetch(base64Image);
            const blob = await response.blob();
            const contentType = blob.type || 'image/jpeg';
            const extension = contentType.split('/')[1] || 'jpg';
            const fileName = `project-${Date.now()}-${index}.${extension}`;
            const filePath = `projects/${fileName}`;

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
        if (!formData.name.trim()) {
            toast.error('Informe o nome do projeto');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Adicione uma descrição curta');
            return false;
        }
        if (!formData.location.trim()) {
            toast.error('Informe a localização');
            return false;
        }
        if (formData.price_per_sqm <= 0) {
            toast.error('Preço por m² deve ser maior que zero');
            return false;
        }
        if (formData.available_area <= 0) {
            toast.error('Área disponível deve ser maior que zero');
            return false;
        }
        if (formData.total_area <= 0) {
            toast.error('Área total deve ser maior que zero');
            return false;
        }
        if (formData.total_area < formData.available_area) {
            toast.error('Área total não pode ser menor que a disponível');
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
            const gallery_images = await processGalleryImages();

            if (gallery_images.length === 0) {
                toast.error('Não foi possível processar as imagens do projeto');
                setSaving(false);
                return;
            }

            const coverImage = gallery_images[0];
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                long_description: formData.long_description.trim(),
                location: formData.location.trim(),
                type: formData.type,
                price_per_sqm: Number(formData.price_per_sqm),
                price_per_m2: Number(formData.price_per_sqm), // Legacy support if column exists
                available_area: Number(formData.available_area),
                available_m2: Number(formData.available_area), // Legacy support
                total_area: Number(formData.total_area || formData.available_area),
                total_m2: Number(formData.total_area || formData.available_area), // Legacy support
                status: formData.status,
                image: coverImage,
                image_url: coverImage, // Ensure consistent naming if one has renamed
                main_image: coverImage,
                gallery_images
            };

            if (editingProject) {
                const { error } = await supabase
                    .from('projects')
                    .update(payload)
                    .eq('id', editingProject.id);

                if (error) throw error;
                toast.success('Projeto atualizado!');
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert([payload]);

                if (error) throw error;
                toast.success('Projeto criado!');
            }

            setShowModal(false);
            setEditingProject(null);
            setFormData(emptyForm);
            await onReload();
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error('Erro ao salvar projeto');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        Catálogo de Projetos
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Gerencie e monitore seus projetos de sustentabilidade
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onReload()}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300"
                        title="Atualizar lista"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Novo Projeto</span>
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhum projeto encontrado</h3>
                    <p className="text-gray-400 text-sm mt-1 mb-6">Comece adicionando seu primeiro projeto de impacto.</p>
                    <button
                        onClick={handleAdd}
                        className="text-emerald-600 font-medium hover:underline"
                    >
                        Adicionar projeto agora
                    </button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project: Project) => (
                        <GlassCard
                            key={project.id}
                            className="group flex flex-col overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border-0 bg-white/40 backdrop-blur-md"
                        >
                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                                <span className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${project.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/20'
                                        : 'bg-gray-500/20 text-gray-100 border border-gray-500/20'
                                    }`}>
                                    {project.status === 'active' ? 'Ativo' : project.status}
                                </span>

                                {(project.image || project.image_url) ? (
                                    <img
                                        src={project.image || project.image_url}
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {project.location}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                        {project.name}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-medium mb-0.5">Preço/m²</p>
                                        <p className="text-sm font-bold text-gray-900">R$ {project.price_per_sqm}</p>
                                    </div>
                                    <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium mb-0.5">Disponível</p>
                                        <p className="text-sm font-bold text-gray-900">{project.available_area} m²</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    Atualizado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(project.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-transparent rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                                    {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Preencha as informações abaixo para publicar
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-8">
                                    {/* Section 1: Basic */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium pb-2 border-b border-emerald-100">
                                            <Tag className="w-4 h-4" />
                                            <span>Informações Básicas</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Nome do Projeto</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ex: Reflorestamento Amazônia Legal"
                                                    className={cmsTokens.input}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Resumo</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className={`${cmsTokens.input} min-h-[80px]`}
                                                    placeholder="Uma breve descrição que aparecerá no card..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Narrativa Completa</label>
                                                <textarea
                                                    value={formData.long_description || ''}
                                                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                                    className={`${cmsTokens.input} min-h-[160px]`}
                                                    placeholder="Detalhes completos sobre o impacto, metodologia e história do projeto..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Geo */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium pb-2 border-b border-emerald-100">
                                            <MapPin className="w-4 h-4" />
                                            <span>Localização</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Local</label>
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    placeholder="Cidade - UF"
                                                    className={cmsTokens.input}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className={cmsTokens.input}
                                                >
                                                    <option value="conservation">Conservação</option>
                                                    <option value="reforestation">Reflorestamento</option>
                                                    <option value="restoration">Restauração</option>
                                                    <option value="blue_carbon">Blue Carbon</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Metrics & Media */}
                                <div className="space-y-8">
                                    {/* Section 3: Metrics */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium pb-2 border-b border-emerald-100">
                                            <Ruler className="w-4 h-4" />
                                            <span>Métricas de Venda</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Preço por m² (R$)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.price_per_sqm}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            price_per_sqm: e.target.value ? Number(e.target.value) : 0
                                                        })}
                                                        className={`${cmsTokens.input} pl-9`}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Área Total</label>
                                                <input
                                                    type="number"
                                                    value={formData.total_area}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        total_area: e.target.value ? Number(e.target.value) : 0
                                                    })}
                                                    className={cmsTokens.input}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Disponível</label>
                                                <input
                                                    type="number"
                                                    value={formData.available_area}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        available_area: e.target.value ? Number(e.target.value) : 0
                                                    })}
                                                    className={cmsTokens.input}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Media */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium pb-2 border-b border-emerald-100">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>Galeria de Imagens</span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                                            <ImageUploadWithResizer
                                                images={formData.gallery_images}
                                                onChange={(images) => setFormData((prev) => ({
                                                    ...prev,
                                                    gallery_images: images,
                                                    image: images[0] || prev.image
                                                }))}
                                                maxImages={5}
                                                maxFileSize={5}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Salvando...' : editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
