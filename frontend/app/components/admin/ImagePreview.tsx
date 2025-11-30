'use client';

import { useState } from 'react';

interface ImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxImages?: number;
  editable?: boolean;
}

export default function ImagePreview({ 
  images, 
  onRemove, 
  onReorder, 
  maxImages = 6, 
  editable = true 
}: ImagePreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!editable) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!editable || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!editable || draggedIndex === null || !onReorder) return;
    e.preventDefault();
    
    if (draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <div className="text-4xl mb-2">📷</div>
        <p>Aucune image ajoutée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="text-white font-semibold">
          Images ({images.length}/{maxImages})
        </h5>
        {editable && onReorder && (
          <p className="text-white/60 text-sm">
            Glissez pour réorganiser
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              dragOverIndex === index && draggedIndex !== index
                ? 'border-accent border-dashed scale-105'
                : draggedIndex === index
                ? 'border-accent opacity-50 scale-95'
                : 'border-white/20 hover:border-white/40'
            }`}
            draggable={editable && !!onReorder}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Image */}
            <div className="aspect-square relative">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
              
              {/* Actions - Toujours visible */}
              {editable && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => onRemove(index)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-lg hover:scale-110 active:scale-95"
                    title="Supprimer cette image"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
                {index === 0 && (
                  <span className="ml-1 text-yellow-400">★</span>
                )}
              </div>
              
              {/* Drag Handle */}
              {editable && onReorder && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center cursor-move">
                    <span className="text-white text-xs">⋮⋮</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-xs truncate">
                {image.split('/').pop() || `Image ${index + 1}`}
              </p>
            </div>
          </div>
        ))}
        
        {/* Add More Placeholder */}
        {editable && images.length < maxImages && (
          <div className="aspect-square border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white/70 transition-colors cursor-pointer">
            <div className="text-center">
              <div className="text-2xl mb-1">+</div>
              <div className="text-xs">Ajouter</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tips */}
      {editable && (
        <div className="text-white/60 text-sm space-y-1">
          <p>💡 La première image sera utilisée comme image principale</p>
          {onReorder && (
            <p>🔄 Glissez-déposez pour réorganiser les images</p>
          )}
          <p>🗑️ Survolez une image et cliquez sur × pour la supprimer</p>
        </div>
      )}
    </div>
  );
}