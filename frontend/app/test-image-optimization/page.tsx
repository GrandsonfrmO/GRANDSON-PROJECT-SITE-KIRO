'use client';

import { useState } from 'react';
import OptimizedImage from '../components/OptimizedImage';
import { getImageUrl, ImageSize } from '../lib/imageOptimization';

const TEST_IMAGE = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

export default function TestImageOptimization() {
  const [selectedSize, setSelectedSize] = useState<ImageSize>('card');
  const [showComparison, setShowComparison] = useState(false);

  const sizes: ImageSize[] = ['thumbnail', 'cart', 'gallery', 'card', 'detail', 'logo'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Image Optimization Test
        </h1>

        {/* Size Selector */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Select Image Size
          </h2>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-accent text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-white font-semibold">
              Show Before/After Comparison
            </span>
          </label>
        </div>

        {/* Image Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Optimized Image */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Optimized Image ({selectedSize})
            </h3>
            <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden mb-4">
              <OptimizedImage
                src={TEST_IMAGE}
                alt="Test Image"
                size={selectedSize}
                fill
                priority={false}
                loading="lazy"
              />
            </div>
            <div className="text-white/70 text-sm space-y-1">
              <p><strong>URL:</strong></p>
              <p className="break-all text-xs bg-black/30 p-2 rounded">
                {getImageUrl(TEST_IMAGE, selectedSize)}
              </p>
            </div>
          </div>

          {/* Original Image (if comparison enabled) */}
          {showComparison && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Original Image (No Optimization)
              </h3>
              <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden mb-4">
                <img
                  src={TEST_IMAGE}
                  alt="Original Test Image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white/70 text-sm space-y-1">
                <p><strong>URL:</strong></p>
                <p className="break-all text-xs bg-black/30 p-2 rounded">
                  {TEST_IMAGE}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lazy Loading Test */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Lazy Loading Test
          </h2>
          <p className="text-white/70 mb-4">
            Scroll down to see images load as they enter the viewport
          </p>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="relative aspect-video bg-neutral-800 rounded-xl overflow-hidden">
                <OptimizedImage
                  src={`https://res.cloudinary.com/demo/image/upload/sample${i === 1 ? '' : i}.jpg`}
                  alt={`Lazy Load Test ${i}`}
                  size="card"
                  fill
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded">
                  Image {i}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preloading Test */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Preloading Information
          </h2>
          <div className="text-white/70 space-y-2">
            <p>✅ Adjacent images are preloaded in galleries</p>
            <p>✅ Intersection Observer for lazy loading</p>
            <p>✅ Progressive JPEG loading</p>
            <p>✅ Automatic DPR for retina displays</p>
            <p>✅ WebP/AVIF format when supported</p>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-accent/20 backdrop-blur-xl rounded-2xl p-6 mt-8 border border-accent/30">
          <h2 className="text-xl font-semibold text-white mb-4">
            💡 Performance Tips
          </h2>
          <ul className="text-white/80 space-y-2 list-disc list-inside">
            <li>Use <code className="bg-black/30 px-2 py-1 rounded">thumbnail</code> for grid views</li>
            <li>Use <code className="bg-black/30 px-2 py-1 rounded">card</code> for product cards</li>
            <li>Use <code className="bg-black/30 px-2 py-1 rounded">detail</code> for full-size views</li>
            <li>Enable lazy loading for below-the-fold images</li>
            <li>Set priority={'{true}'} for above-the-fold images</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
