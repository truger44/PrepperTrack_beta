import React, { useState, useCallback } from 'react';
import { useBatterySaverContext } from './BatterySaverProvider';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  lowQualitySrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallback,
  lowQualitySrc,
  className = '',
  ...props
}: OptimizedImageProps) {
  const { performanceLevel, optimizations } = useBatterySaverContext();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  // Determine which image source to use based on performance level
  const getImageSrc = useCallback(() => {
    if (imageError && fallback) {
      return fallback;
    }

    // Use low quality image for battery saving
    if (optimizations.rendering && lowQualitySrc) {
      return lowQualitySrc;
    }

    // Use low quality for low performance devices
    if (performanceLevel === 'low' && lowQualitySrc) {
      return lowQualitySrc;
    }

    return src;
  }, [src, lowQualitySrc, fallback, imageError, optimizations.rendering, performanceLevel]);

  // Don't render images in extreme battery saving mode
  if (performanceLevel === 'low' && optimizations.rendering && !lowQualitySrc) {
    return (
      <div 
        className={`bg-slate-200 flex items-center justify-center text-slate-500 text-sm ${className}`}
        {...props}
      >
        {alt}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`bg-slate-200 animate-pulse ${className}`}
          {...props}
        />
      )}
      <img
        src={getImageSrc()}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={optimizations.rendering ? 'lazy' : 'eager'}
        {...props}
      />
    </>
  );
}