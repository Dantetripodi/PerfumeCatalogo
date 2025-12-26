import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  base?: string;
  webpDefault?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  base, 
  webpDefault 
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <span className="text-gray-400 text-sm">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {isIntersecting && (
        <picture>
          {base && webpDefault && (
            <source
              type="image/webp"
              srcSet={`
                ${base}-320.webp 320w,
                ${base}-640.webp 640w,
                ${base}-960.webp 960w,
                ${webpDefault} 1200w
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          <img 
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
      {!loaded && isIntersecting && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;