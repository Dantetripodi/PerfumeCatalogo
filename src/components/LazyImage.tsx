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

  return (
    <div ref={ref} className={className}>
      {isIntersecting && (
        <picture>
          {/* Solo mostrar WebP si existen los archivos */}
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
            className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;