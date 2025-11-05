import { useEffect, useState, useCallback } from 'react';

interface ParallaxOptions {
  speed?: number;
  offset?: number;
  direction?: 'up' | 'down';
  throttle?: number;
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, offset = 0, direction = 'up', throttle = 16 } = options;
  const [scrollY, setScrollY] = useState(0);
  const [transform, setTransform] = useState('translateY(0px)');

  // Throttle function for better performance
  const throttleFunction = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setScrollY(scrollTop);
          
          // Calculate parallax transform
          const parallaxValue = (scrollTop + offset) * speed;
          const translateDirection = direction === 'up' ? -parallaxValue : parallaxValue;
          setTransform(`translateY(${translateDirection}px)`);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, offset, direction]);

  return {
    scrollY,
    transform,
    // Helper functions for common parallax effects
    getParallaxStyle: (customSpeed?: number) => ({
      transform: `translateY(${((scrollY + offset) * (customSpeed || speed)) * (direction === 'up' ? -1 : 1)}px)`
    }),
    getRotationStyle: (rotationSpeed: number = 0.1) => ({
      transform: `${transform} rotate(${scrollY * rotationSpeed}deg)`
    }),
    getScaleStyle: (scaleSpeed: number = 0.001, minScale: number = 0.8, maxScale: number = 1.2) => {
      const scale = Math.min(maxScale, Math.max(minScale, 1 + (scrollY * scaleSpeed)));
      return {
        transform: `${transform} scale(${scale})`
      };
    },
    getOpacityStyle: (fadeSpeed: number = 0.001, minOpacity: number = 0, maxOpacity: number = 1) => {
      const opacity = Math.min(maxOpacity, Math.max(minOpacity, 1 - (scrollY * fadeSpeed)));
      return { opacity };
    }
  };
}

// Hook específico para floating elements
export function useFloatingAnimation(duration: number = 6000, amplitude: number = 20) {
  const [floatOffset, setFloatOffset] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      const offset = Math.sin(progress * Math.PI * 2) * amplitude;
      setFloatOffset(offset);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [duration, amplitude]);

  return {
    floatingStyle: {
      transform: `translateY(${floatOffset}px)`
    }
  };
}

// Hook para animações de entrada baseadas no scroll
export function useScrollReveal(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold]);

  return {
    isVisible,
    ref: setElement,
    className: `transition-all duration-1000 ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`
  };
}