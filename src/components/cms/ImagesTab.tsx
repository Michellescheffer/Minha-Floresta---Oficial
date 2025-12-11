import React, { useState } from 'react';
import { Upload, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../services/supabaseClient';
import { cmsTokens } from './constants';

interface ImagesTabProps {
    siteImages: any[];
    certImages: any[];
    onReload: () => void;
}

export function ImagesTab({ siteImages, certImages, onReload }: ImagesTabProps) {
    const [uploading, setUploading] = useState(false);
    const heroSlots = [
        {
            key: 'hero_primary',
            label: 'Imagem principal',
            description: 'Primeiros 5 segundos – destaque desktop',
            accent: 'from-emerald-500 to-teal-500',
        },
        {
            key: 'hero_secondary',
            label: 'Imagem secundária',
            description: 'Transição intermediária e tablet',
            accent: 'from-blue-500 to-cyan-500',
        },
        {
            key: 'hero_tertiary',
            label: 'Imagem terciária',
            description: 'Fallback mobile / campanhas sazonais',
            accent: 'from-amber-500 to-orange-500',
        },
    ];

    const handleUploadSiteImage = async (file: File, slotKey?: string) => {
        if (!file) return;
        if (!slotKey && siteImages.length >= heroSlots.length) {
            toast.error('Máximo de 3 imagens do Hero permitido');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Imagem muito grande! Máximo 5MB');
            return;
        }

        try {
            setUploading(true);
            let fileToUpload = file;
            if (file.size > 1024 * 1024) {
                fileToUpload = await compressImage(file);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `site-${Date.now()}.${fileExt}`;
            const filePath = `site/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, fileToUpload);
            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from('images').getPublicUrl(filePath);

            const resolvedKey =
                slotKey || heroSlots[siteImages.length]?.key || `hero_${siteImages.length + 1}`;
            const slotIndex = heroSlots.findIndex((slot) => slot.key === resolvedKey);
            const displayOrder = slotIndex >= 0 ? slotIndex : siteImages.length;

            const { error: dbError } = await supabase
                .from('site_images')
                .upsert(
                    [
                        {
                            key: resolvedKey,
                            url: publicUrl,
                            alt_text: file.name,
                            display_order: displayOrder,
                            is_active: true,
                        },
                    ],
                    { onConflict: 'key' },
                );
            if (dbError) throw dbError;

            toast.success('Imagem do site adicionada!');
            onReload();
        } catch (error: any) {
            console.error('Error uploading site image:', error);
            if (error.message?.includes('exceeded')) {
                toast.error('Imagem muito grande! Tente uma menor.');
            } else {
                toast.error('Erro ao enviar imagem');
            }
        } finally {
            setUploading(false);
        }
    };

    // Helper function to compress images
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const maxWidth = 1920;
                    const maxHeight = 1080;

                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Compression failed'));
                            }
                        },
                        'image/jpeg',
                        0.85
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleUploadCertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (certImages.length >= 8) {
            toast.error('Máximo de 8 imagens de certificado permitido');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Imagem muito grande! Máximo 5MB');
            return;
        }

        try {
            setUploading(true);

            // Compress if needed
            let fileToUpload = file;
            if (file.size > 1024 * 1024) {
                fileToUpload = await compressImage(file);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `cert-${Date.now()}.${fileExt}`;
            const filePath = `certificates/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            // Insert into certificate_images table
            const { error: dbError } = await supabase
                .from('certificate_images')
                .insert([{
                    url: publicUrl,
                    alt_text: 'Certificate Image',
                    display_order: certImages.length + 1,
                    is_active: true
                }]);

            if (dbError) throw dbError;

            toast.success('Imagem de certificado adicionada!');
            onReload();
        } catch (error) {
            console.error('Error uploading cert image:', error);
            toast.error('Erro ao enviar imagem');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteSiteImage = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

        try {
            // Extract file path from URL
            const urlParts = url.split('/');
            const filePath = urlParts.slice(-2).join('/');

            // Delete from storage
            await supabase.storage.from('images').remove([filePath]);

            // Delete from database
            const { error } = await supabase
                .from('site_images')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Imagem excluída!');
            onReload();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Erro ao excluir imagem');
        }
    };

    const handleDeleteCertImage = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

        try {
            // Extract file path from URL
            const urlParts = url.split('/');
            const filePath = urlParts.slice(-2).join('/');

            // Delete from storage
            await supabase.storage.from('images').remove([filePath]);

            // Delete from database
            const { error } = await supabase
                .from('certificate_images')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Imagem excluída!');
            onReload();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Erro ao excluir imagem');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <p className={cmsTokens.heading}>Biblioteca visual</p>
                    <h2 className="text-2xl font-bold text-gray-900">Gerenciar imagens</h2>
                    <p className="text-sm text-gray-500">
                        Atualize os banners do site e a galeria usada nos certificados digitais.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onReload}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Recarregar
                </button>
            </div>

            {/* Hero slots */}
            <section className={`${cmsTokens.glass} p-6 space-y-6`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Hero Banner</h3>
                        <p className="text-sm text-gray-500">
                            Escolha até 3 imagens para rotacionar a cada 5 segundos no topo do site.
                        </p>
                    </div>
                    <span className="text-xs text-gray-500">{siteImages.length}/3 slots preenchidos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroSlots.map((slot) => {
                        const current = siteImages.find((img: any) => img.key === slot.key);
                        return (
                            <div
                                key={slot.key}
                                className="relative rounded-[24px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 flex flex-col gap-4 shadow-md"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${slot.accent} opacity-10 rounded-[24px] pointer-events-none`}
                                />
                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                                        <p className="text-xs text-gray-500">{slot.description}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 text-xs rounded-full ${current ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {current ? 'Em uso' : 'Vazio'}
                                    </span>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-40">
                                    {current ? (
                                        <img
                                            src={current.url}
                                            alt={current.alt_text || slot.label}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                                            <ImageIcon className="w-5 h-5" />
                                            Aguardando upload
                                        </div>
                                    )}
                                </div>
                                <div className="relative flex gap-2">
                                    <label
                                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg'
                                            } transition`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {uploading ? 'Enviando...' : current ? 'Substituir' : 'Enviar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadSiteImage(file, slot.key);
                                            }}
                                        />
                                    </label>
                                    {current && (
                                        <button
                                            onClick={() => handleDeleteSiteImage(current.id, current.url)}
                                            className="px-3 py-2 rounded-xl border border-transparent text-sm text-red-600 hover:bg-red-50 transition"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Certificate gallery */}
            <section className={`${cmsTokens.glass} p-6 space-y-6`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Galeria de certificados ({certImages.length}/8)
                        </h3>
                        <p className="text-sm text-gray-500">
                            As imagens são sorteadas aleatoriamente em cada certificado emitido.
                        </p>
                    </div>
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white ${certImages.length >= 8 || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
                        } transition`}>
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Enviando...' : 'Adicionar imagem'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading || certImages.length >= 8}
                            onChange={handleUploadCertImage}
                        />
                    </label>
                </div>

                {certImages.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        Nenhuma imagem cadastrada ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {certImages.map((image: any, index: number) => (
                            <article
                                key={image.id}
                                className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-3 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-medium text-gray-900">#{index + 1}</span>
                                    <button
                                        onClick={() => handleDeleteCertImage(image.id, image.url)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="rounded-xl overflow-hidden h-40 bg-gray-100">
                                    <img
                                        src={image.url}
                                        alt={image.alt_text || `Certificado ${index + 1}`}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => window.open(image.url, '_blank')}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {image.alt_text || 'Sem descrição'}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
