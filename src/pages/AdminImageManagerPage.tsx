import { useState, useEffect } from 'react';
import { Upload, Trash2, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { GlassCard } from '../components/GlassCard';

interface SiteImage {
  id: string;
  key: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
}

interface CertificateImage {
  id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminImageManagerPage() {
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [certificateImages, setCertificateImages] = useState<CertificateImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'site' | 'certificate'>('site');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      
      // Load site images
      const { data: siteData, error: siteError } = await supabase
        .from('site_images')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (siteError) throw siteError;
      setSiteImages(siteData || []);

      // Load certificate images
      const { data: certData, error: certError } = await supabase
        .from('certificate_images')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (certError) throw certError;
      setCertificateImages(certData || []);
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Erro ao carregar imagens');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSiteImage = async (file: File, key: string) => {
    try {
      setUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `site/${key}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      // Insert or update in database
      const { error: dbError } = await supabase
        .from('site_images')
        .upsert({
          key,
          url: publicUrl,
          alt_text: file.name,
          display_order: siteImages.length + 1
        });
      
      if (dbError) throw dbError;
      
      await loadImages();
      alert('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCertificateImage = async (file: File) => {
    try {
      setUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `certificates/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      // Insert in database
      const { error: dbError } = await supabase
        .from('certificate_images')
        .insert({
          url: publicUrl,
          alt_text: file.name,
          display_order: certificateImages.length + 1
        });
      
      if (dbError) throw dbError;
      
      await loadImages();
      alert('Imagem adicionada à galeria!');
    } catch (error) {
      console.error('Error uploading certificate image:', error);
      alert('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificateImage = async (id: string, url: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
    
    try {
      // Delete from storage
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('images').remove([`certificates/${fileName}`]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('certificate_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadImages();
      alert('Imagem excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erro ao excluir imagem');
    }
  };

  const handleReorderCertificateImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = certificateImages.findIndex(img => img.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= certificateImages.length) return;
    
    const newOrder = [...certificateImages];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    // Update display_order for both images
    try {
      await Promise.all([
        supabase.from('certificate_images').update({ display_order: newIndex + 1 }).eq('id', newOrder[newIndex].id),
        supabase.from('certificate_images').update({ display_order: currentIndex + 1 }).eq('id', newOrder[currentIndex].id)
      ]);
      
      await loadImages();
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Erro ao reordenar imagens');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-56 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-56 pb-16 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gerenciar Imagens</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('site')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'site'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Imagens do Site
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'certificate'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Galeria de Certificados ({certificateImages.length}/8)
          </button>
        </div>

        {/* Site Images Tab */}
        {activeTab === 'site' && (
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Imagens do Hero</h2>
            
            <div className="space-y-6">
              {['hero_primary', 'hero_secondary'].map((key) => {
                const image = siteImages.find(img => img.key === key);
                return (
                  <div key={key} className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {key === 'hero_primary' ? 'Imagem Principal (0-5s)' : 'Imagem Secundária (5s+)'}
                    </h3>
                    
                    {image && (
                      <div className="mb-4">
                        <img src={image.url} alt={image.alt_text || ''} className="w-full max-h-64 object-cover rounded-lg" />
                      </div>
                    )}
                    
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer w-fit">
                      <Upload className="w-5 h-5" />
                      <span>{image ? 'Substituir' : 'Enviar'} Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSiteImage(file, key);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Certificate Images Tab */}
        {activeTab === 'certificate' && (
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Galeria de Imagens dos Certificados</h2>
              
              {certificateImages.length < 8 && (
                <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Adicionar Imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCertificateImage(file);
                    }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">
              Adicione de 1 a 8 imagens que serão exibidas aleatoriamente nos certificados.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificateImages.map((image, index) => (
                <div key={image.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="relative mb-4">
                    <img src={image.url} alt={image.alt_text || ''} className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorderCertificateImage(image.id, 'up')}
                      disabled={index === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleReorderCertificateImage(image.id, 'down')}
                      disabled={index === certificateImages.length - 1}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCertificateImage(image.id, image.url)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {certificateImages.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma imagem adicionada ainda</p>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
