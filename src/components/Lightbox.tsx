import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setZoom(1);
    }, 200);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex items-center justify-center ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-[10001] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-md"
        aria-label="Fechar"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-[10001] flex gap-2">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Aumentar zoom"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Diminuir zoom"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <div className="px-4 py-3 bg-white/10 rounded-full backdrop-blur-md">
          <span className="text-white text-sm font-medium">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-md"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-md"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10001] px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 overflow-auto">
        <img
          src={images[currentIndex]}
          alt={`Imagem ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            transform: `scale(${zoom})`,
            cursor: zoom > 1 ? 'move' : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[10001] flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setZoom(1);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex
                  ? 'border-white scale-110'
                  : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
