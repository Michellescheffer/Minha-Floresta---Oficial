import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, GripVertical, Trash2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  height: number;
  originalHeight: number;
  name: string;
  size: number;
}

interface ImageUploadWithResizerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // em MB
}

export function ImageUploadWithResizer({ 
  images, 
  onChange, 
  maxImages = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5
}: ImageUploadWithResizerProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>(() => 
    images.map((url, index) => ({
      id: `existing-${index}`,
      url,
      height: 200,
      originalHeight: 200,
      name: `Imagem ${index + 1}`,
      size: 0
    }))
  );
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Converte File para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Valida arquivo
  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`);
      return false;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${maxFileSize}MB`);
      return false;
    }
    
    return true;
  };

  // Processa upload de arquivos
  const handleFileSelect = async (files: FileList) => {
    const newFiles = Array.from(files);
    
    if (imageItems.length + newFiles.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const validFiles = newFiles.filter(validateFile);
    
    for (const file of validFiles) {
      try {
        const base64 = await fileToBase64(file);
        const newImage: ImageItem = {
          id: `new-${Date.now()}-${Math.random()}`,
          url: base64,
          file,
          height: 200,
          originalHeight: 200,
          name: file.name,
          size: file.size
        };
        
        setImageItems(prev => [...prev, newImage]);
      } catch (error) {
        toast.error(`Erro ao processar arquivo: ${file.name}`);
      }
    }
  };

  // Atualiza onChange quando imageItems muda
  React.useEffect(() => {
    const urls = imageItems.map(item => item.url);
    onChange(urls);
  }, [imageItems, onChange]);

  // Drag and drop para upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [imageItems.length, maxImages]);

  // Redimensionamento de altura
  const handleResizeStart = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault();
    const item = imageItems.find(img => img.id === imageId);
    if (!item) return;

    setDraggedItem(imageId);
    setStartY(e.clientY);
    setStartHeight(item.height);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!draggedItem) return;
    
    const deltaY = e.clientY - startY;
    const newHeight = Math.max(100, Math.min(400, startHeight + deltaY));
    
    setImageItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, height: newHeight }
        : item
    ));
  }, [draggedItem, startY, startHeight]);

  const handleResizeEnd = useCallback(() => {
    setDraggedItem(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]);

  // Remove imagem
  const removeImage = (imageId: string) => {
    setImageItems(prev => prev.filter(item => item.id !== imageId));
    toast.success('Imagem removida');
  };

  // Reset altura
  const resetHeight = (imageId: string) => {
    setImageItems(prev => prev.map(item => 
      item.id === imageId 
        ? { ...item, height: item.originalHeight }
        : item
    ));
  };

  // Formatação de tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700">
          Imagens do Projeto ({imageItems.length}/{maxImages})
        </Label>
        <p className="text-xs text-gray-500 mt-1">
          Clique e arraste a alça para ajustar a altura das imagens
        </p>
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-green-400 bg-green-50/20' 
            : 'border-gray-300 hover:border-green-400 bg-white/10 backdrop-blur-md'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <Upload className={`h-8 w-8 mx-auto mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 mb-2">
            {isDragging ? 'Solte as imagens aqui' : 'Clique ou arraste imagens para fazer upload'}
          </p>
          <p className="text-xs text-gray-500">
            Formatos: JPEG, PNG, WebP • Máximo: {maxFileSize}MB por arquivo
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Images Grid */}
      {imageItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {imageItems.map((item) => (
            <Card key={item.id} className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative group">
                  <img
                    src={item.url}
                    alt={item.name}
                    style={{ height: `${item.height}px` }}
                    className="w-full object-cover transition-all duration-200"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30"
                      onClick={() => resetHeight(item.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/80 backdrop-blur-md border-red-400 hover:bg-red-600/80"
                      onClick={() => removeImage(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Resize Handle */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded-t-md cursor-ns-resize hover:bg-green-600 transition-colors group-hover:opacity-100 opacity-60"
                    onMouseDown={(e) => handleResizeStart(e, item.id)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.height}px
                    </Badge>
                  </div>
                  
                  {item.size > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(item.size)}</span>
                      <span className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        Imagem
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      {imageItems.length > 0 && (
        <Card className="bg-blue-50/20 backdrop-blur-md border-blue-200/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700">Como ajustar a altura:</p>
                <ul className="text-blue-600 mt-1 space-y-1">
                  <li>• Passe o mouse sobre uma imagem para ver os controles</li>
                  <li>• Clique e arraste a alça verde na parte inferior</li>
                  <li>• Use o botão de reset para voltar ao tamanho original</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}