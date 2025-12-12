import React, { useState } from 'react';
import { RefreshCw, Save, X, Plus, MapPin, Tag, DollarSign, Ruler, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../services/supabaseClient';
import { ImageUploadWithResizer } from '../ImageUploadWithResizer';
import { cmsTokens } from './constants';
import { Project } from './types';
import { GlassCard } from '../GlassCard';



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
            if (editingProject) {
                // Update Logic: REVERTED to available_area but cleaned up.
                // The error `Could not find the 'available_m2' column` confirms insert vs update schema difference (or at least update strictness).
                const updatePayload: any = {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    // long_description removed (Schema mismatch)
                    location: formData.location.trim(),
                    type: formData.type,
                    price_per_m2: Number(formData.price_per_sqm),

                    // FIXED (AGAIN): Reverting to 'available_area' for UPDATE as 'available_m2' caused "Column not found".
                    available_area: Number(formData.available_area),

                    // We must NOT send 'total_m2' or 'available_m2' if they don't exist in the schema for valid targets of UPDATE.
                    // If 'sold_area' is updated via transaction or is calculable, we might omit it,
                    // BUT legacy code sent it. We will omit it to be safe unless needed.
                    // Actually, let's include sold_area if we have it, as per hook.
                    sold_area: Number(formData.total_area || formData.available_area) - Number(formData.available_area),

                    status: formData.status,
                    main_image: coverImage,
                    gallery_images
                };

                const { error } = await supabase
                    .from('projects')
                    .update(updatePayload)
                    .eq('id', editingProject.id);

                if (error) throw error;
                toast.success('Projeto atualizado!');
            } else {
                // Insert Logic
                const insertPayload: any = {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    // long_description removed (Schema mismatch)
                    location: formData.location.trim(),
                    type: formData.type,
                    price_per_m2: Number(formData.price_per_sqm),
                    available_m2: Number(formData.available_area),
                    total_m2: Number(formData.total_area || formData.available_area),
                    status: formData.status,
                    image: coverImage,
                    gallery_images
                };

                const { error } = await supabase
                    .from('projects')
                    .insert([insertPayload]);

                if (error) throw error;
                toast.success('Projeto criado!');
            }

            setShowModal(false);
            setEditingProject(null);
            setFormData(emptyForm);
            await onReload();
        } catch (error: any) {
            console.error('Error saving project:', error);
            // More detailed error message
            toast.error(`Erro ao salvar: ${error.message || error.details || 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">
                        Catálogo de Projetos
                    </h2>
                    <p className="text-gray-500 text-base mt-2 font-medium">
                        Gerencie e monitore seus projetos de sustentabilidade com precisão.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onReload()}
                        className={cmsTokens.button.secondary + " flex items-center justify-center w-12 h-12"}
                        title="Atualizar lista"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-700" />
                    </button>

                    <button
                        onClick={handleAdd}
                        className={cmsTokens.button.primary + " px-6 py-3 flex items-center gap-2.5"}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Novo Projeto</span>
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <GlassCard variant="flat" className="p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-100/50 bg-white/30">
                    <div className="w-20 h-20 bg-gradient-to-br from-white to-white/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/5 ring-1 ring-white/60">
                        <ImageIcon className="w-8 h-8 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Nenhum projeto encontrado</h3>
                    <p className="text-gray-500 text-base mt-2 mb-8 max-w-sm mx-auto">
                        Seu catálogo está vazio. Comece adicionando seu primeiro projeto de impacto ambiental.
                    </p>
                    <button
                        onClick={handleAdd}
                        className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline underline-offset-4 decoration-2 transition-all"
                    >
                        Adicionar projeto agora
                    </button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {projects.map((project: Project) => (
                        <GlassCard
                            key={project.id}
                            variant="solid"
                            hoverEffect
                            className="group flex flex-col overflow-hidden"
                        >
                            {/* Image Area */}
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                                {/* Floating Status Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl border shadow-lg ${project.status === 'active'
                                        ? 'bg-emerald-500/30 text-emerald-50 border-emerald-400/30'
                                        : 'bg-gray-800/40 text-gray-200 border-gray-600/30'
                                        }`}>
                                        {project.status === 'active' ? 'ATIVO' : project.status.toUpperCase()}
                                    </span>
                                </div>

                                {(project.image || project.image_url) ? (
                                    <img
                                        src={project.image || project.image_url}
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex-1 flex flex-col gap-4">
                                <div className="relative">
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-2 uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {project.location}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight">
                                        {project.name}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <div className="bg-white/40 p-3 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
                                        <p className="text-[10px] uppercase tracking-wider text-emerald-600/80 font-bold mb-1">Preço/m²</p>
                                        <p className="text-base font-bold text-gray-900">R$ {project.price_per_sqm}</p>
                                    </div>
                                    <div className="bg-white/40 p-3 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600/80 font-bold mb-1">Disponível</p>
                                        <p className="text-base font-bold text-gray-900">{project.available_area} m²</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="px-6 py-4 border-t border-white/40 bg-white/30 flex items-center justify-between backdrop-blur-md">
                                <span className="text-xs text-gray-500 font-medium">
                                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="p-2 text-gray-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-emerald-500/30"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(project.id)}
                                        className="p-2 text-gray-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-red-500/30"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )
            }

            {/* Modal - Liquid Glass Style */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
                        <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 bg-white shadow-2xl rounded-[2rem] ring-1 ring-black/5 overflow-hidden">

                            {/* Decorative Gradients (Subtler) */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-700">
                                        {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">
                                        Preencha as informações técnicas e visuais abaixo.
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
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Column: Basic Info */}
                                    <div className="lg:col-span-7 space-y-10">
                                        {/* Section 1: Basic */}
                                        <div className="glass-panel space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-700 font-bold pb-3 border-b border-emerald-100/50">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                                    <Tag className="w-5 h-5" />
                                                </div>
                                                <span>Informações Básicas</span>
                                            </div>

                                            <div className="space-y-5">
                                                <div>
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Nome do Projeto</label>
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
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Resumo</label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className={`${cmsTokens.input} min-h-[100px] resize-none`}
                                                        placeholder="Uma breve descrição que aparecerá no card..."
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Narrativa Completa</label>
                                                    <textarea
                                                        value={formData.long_description || ''}
                                                        onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                                        className={`${cmsTokens.input} min-h-[200px] resize-none`}
                                                        placeholder="Detalhes completos sobre o impacto, metodologia e história do projeto..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Geo */}
                                        <div className="glass-panel space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-700 font-bold pb-3 border-b border-emerald-100/50">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <span>Localização & Tipo</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Local</label>
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
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Categoria</label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.type}
                                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                            className={cmsTokens.input + " appearance-none cursor-pointer"}
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
                                    </div>

                                    {/* Right Column: Metrics & Media */}
                                    <div className="lg:col-span-5 space-y-10">
                                        {/* Section 3: Metrics */}
                                        <div className="glass-panel space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-700 font-bold pb-3 border-b border-emerald-100/50">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                                    <Ruler className="w-5 h-5" />
                                                </div>
                                                <span>Métricas de Venda</span>
                                            </div>

                                            <div className="space-y-5">
                                                <div>
                                                    <label className={cmsTokens.heading + " mb-2 block"}>Preço por m² (R$)</label>
                                                    <div className="relative group">
                                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.price_per_sqm}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                price_per_sqm: e.target.value ? Number(e.target.value) : 0
                                                            })}
                                                            className={`${cmsTokens.input} pl-12 text-lg font-semibold`}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={cmsTokens.heading + " mb-2 block"}>Área Total</label>
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
                                                        <label className={cmsTokens.heading + " mb-2 block"}>Disponível</label>
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
                                        </div>

                                        {/* Section 4: Media */}
                                        <div className="glass-panel space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-700 font-bold pb-3 border-b border-emerald-100/50">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <span>Galeria Visual</span>
                                            </div>

                                            <div className="bg-white/40 p-6 rounded-3xl border border-white/50 border-dashed backdrop-blur-sm shadow-inner transition-all hover:bg-white/50">
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
                                                <div className="mt-4 text-center">
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Arraste imagens ou clique para selecionar. <br />
                                                        A primeira imagem será a capa.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-6 flex flex-col gap-3">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={saving}
                                                className={cmsTokens.button.primary + " w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"}
                                            >
                                                <Save className="w-5 h-5" />
                                                {saving ? 'Publicando...' : editingProject ? 'Salvar Alterações' : 'Publicar Projeto'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className={cmsTokens.button.secondary + " w-full py-3"}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
