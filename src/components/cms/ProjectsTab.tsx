import React, { useState } from 'react';
import { RefreshCw, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../services/supabaseClient';
import { ImageUploadWithResizer } from '../ImageUploadWithResizer';
import { cmsTokens } from './constants';
import { Project } from './types';

const FORM_SECTIONS = [
    {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Título, descrição curta e narrativa completa do projeto.',
    },
    {
        id: 'geo',
        title: 'Localização & Categoria',
        description: 'Defina onde o projeto acontece e o tipo de impacto.',
    },
    {
        id: 'metrics',
        title: 'Metas e Métricas',
        description: 'Preço por metro quadrado e disponibilidade da área.',
    },
    {
        id: 'media',
        title: 'Biblioteca Visual',
        description: 'Faça upload das imagens que representam o projeto.',
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
        <div className="space-y-8">
            <div className={`${cmsTokens.glass} p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
                <div>
                    <p className={cmsTokens.heading}>Catálogo de projetos</p>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-3xl font-bold text-gray-900">{projects.length}</h2>
                        <span className="text-sm text-gray-500">projetos publicados</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Gerencie cards, disponibilidade e storytelling de cada iniciativa em destaque.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onReload}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar lista
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition"
                    >
                        Novo projeto
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className={`${cmsTokens.glass} p-12 text-center text-gray-500`}>
                    Nenhum projeto cadastrado ainda.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {projects.map((project: Project) => (
                        <article
                            key={project.id}
                            className={`${cmsTokens.glass} p-5 flex flex-col gap-4`}
                        >
                            <div className="flex gap-4">
                                <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden">
                                    {(project.image || project.image_url) ? (
                                        <img
                                            src={project.image || project.image_url}
                                            alt={project.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            Sem imagem
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 capitalize">
                                            {project.status === 'active' ? 'ativo' : project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{project.location}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2 font-semibold">
                                            R$ {project.price_per_sqm}/m²
                                        </div>
                                        <div className="rounded-xl bg-gray-100 text-gray-700 px-3 py-2 font-medium">
                                            {project.available_area}m² disponíveis
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Atualizado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="px-3 py-2 rounded-xl border border-transparent text-sm text-blue-600 hover:bg-blue-50 transition"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(project.id)}
                                        className="px-3 py-2 rounded-xl border border-transparent text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {FORM_SECTIONS.map((section) => (
                                <div key={section.id} className="space-y-4">
                                    <div className="space-y-1">
                                        <p className={cmsTokens.heading}>{section.title}</p>
                                        <p className="text-sm text-gray-500">{section.description}</p>
                                    </div>

                                    {section.id === 'basic' && (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Nome do projeto"
                                                className={cmsTokens.input}
                                                required
                                            />
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`${cmsTokens.input} min-h-[70px]`}
                                                placeholder="Descrição breve para o card do site"
                                                required
                                            />
                                            <div>
                                                <textarea
                                                    value={formData.long_description || ''}
                                                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                                    className={`${cmsTokens.input} min-h-[160px]`}
                                                    placeholder="Conte o storytelling completo, metas e etapas do projeto..."
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Este texto aparece na página detalhada do projeto.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'geo' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="Ex: Paragominas - PA"
                                                className={cmsTokens.input}
                                                required
                                            />
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className={cmsTokens.input}
                                            >
                                                <option value="conservation">Conservação</option>
                                                <option value="reforestation">Reflorestamento</option>
                                                <option value="restoration">Restauração</option>
                                            </select>
                                        </div>
                                    )}

                                    {section.id === 'metrics' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'price_per_sqm', label: 'Preço/m²', step: '0.01' },
                                                { id: 'available_area', label: 'Área disponível (m²)' },
                                                { id: 'total_area', label: 'Área total (m²)' },
                                            ].map((field) => (
                                                <div key={field.id}>
                                                    <label className={`${cmsTokens.label} mb-2 block`}>{field.label}</label>
                                                    <input
                                                        type="number"
                                                        step={field.step}
                                                        value={(formData as any)[field.id]}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            [field.id]: e.target.value ? Number(e.target.value) : 0
                                                        })}
                                                        className={cmsTokens.input}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.id === 'media' && (
                                        <div className="space-y-4">
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
                                            <p className="text-xs text-gray-500">
                                                Use imagens com pelo menos 1600px de largura para manter a qualidade no site.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg transition disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Salvando...' : editingProject ? 'Atualizar projeto' : 'Publicar projeto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
