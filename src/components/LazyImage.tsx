import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  base?: string;
  webpDefault?: string;
  /** When true, renders immediately without waiting for IntersectionObserver */
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  base,
  webpDefault,
  priority = false,
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const shouldRender = priority || isIntersecting;

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <span className="text-gray-400 text-sm">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div ref={priority ? undefined : ref} className={`relative overflow-hidden ${className}`}>
      {shouldRender && (
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
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`${imgClassName} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
      {!loaded && shouldRender && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;
