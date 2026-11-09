import { useEffect, useRef, useState, useCallback } from 'react';

interface ShaderUniforms {
  time: number;
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  tintR: number;
  tintG: number;
  tintB: number;
  saturation: number;
  distortion: number;
  blur: number;
  text: string;
  iconSize: number;
  iconColorR: number;
  iconColorG: number;
  iconColorB: number;
  glassMode: 'light' | 'dark';
  shadowIntensity: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  cornerRadius: number;
  chromaticAberration: number;
  shape: string;
  donutThickness: number;
  starPoints: number;
  starInnerRadius: number;
}

interface LiquidGlassShaderProps {
  uniforms: ShaderUniforms;
  className?: string;
  isTransitioning?: boolean;
  onReady?: () => void;
}

// Déclaration globale pour liquidGL
declare global {
  interface Window {
    liquidGL?: (config: any) => {
      destroy: () => void;
      update?: (config: any) => void;
    };
    html2canvas?: any;
  }
}

// Fonction pour charger les scripts nécessaires
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

// Fonction pour charger liquidGL depuis GitHub raw
const loadLiquidGL = async (): Promise<void> => {
  try {
    // Charger html2canvas si pas déjà chargé
    if (!window.html2canvas) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
    
    // Vérifier si liquidGL existe déjà
    if (typeof window.liquidGL === 'function') {
      return;
    }

    // Charger liquidGL.js depuis jsdelivr (CDN pour GitHub)
    try {
      await loadScript('https://cdn.jsdelivr.net/gh/naughtyduk/liquidGL@main/scripts/liquidGL.js');
    } catch (error) {
      // Si le chargement échoue, utiliser le fallback CSS
      console.warn('Could not load liquidGL, using CSS fallback');
    }
  } catch (error) {
    console.error('Error loading liquidGL dependencies:', error);
  }
};

export default function LiquidGlassShader({
  uniforms,
  className = '',
  isTransitioning = false,
  onReady,
}: LiquidGlassShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const liquidGLInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useWebGL, setUseWebGL] = useState(false);

  // Mapper les uniforms aux paramètres liquidGL
  const getLiquidGLConfig = useCallback(() => {
    // Convertir distortion (0-3) en refraction (0-0.1)
    const refraction = Math.min(uniforms.distortion * 0.03, 0.1);
    
    // Convertir blur (0.1-3) en frost (0-10px)
    const frost = uniforms.blur * 3;
    
    // Calculer bevelDepth basé sur cornerRadius et shape
    const bevelDepth = uniforms.shape === 'circle' ? 0.12 : Math.min(uniforms.cornerRadius / 500, 0.15);
    
    return {
      snapshot: 'body',
      target: '.liquid-glass-target',
      resolution: 2.0,
      refraction: refraction,
      bevelDepth: bevelDepth,
      bevelWidth: 0.15,
      frost: frost,
      shadow: uniforms.shadowIntensity > 0,
      specular: true,
      reveal: 'fade',
      tilt: false,
      magnify: 1,
      on: {
        init: () => {
          setIsLoaded(true);
          onReady?.();
        },
      },
    };
  }, [uniforms, onReady]);

  // Charger liquidGL au montage
  useEffect(() => {
    let mounted = true;

    const initLiquidGL = async () => {
      try {
        await loadLiquidGL();
        
        if (!mounted) return;

        // Vérifier si WebGL est disponible
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl && typeof window.liquidGL === 'function') {
          setUseWebGL(true);
          
          // Attendre que le DOM soit prêt
          setTimeout(() => {
            if (!mounted || !glassRef.current) return;

            try {
              const config = getLiquidGLConfig();
              const instance = window.liquidGL!(config);
              liquidGLInstanceRef.current = instance;
            } catch (error) {
              console.error('Error initializing liquidGL:', error);
              setUseWebGL(false);
            }
          }, 100);
        } else {
          setUseWebGL(false);
          setIsLoaded(true);
          onReady?.();
        }
      } catch (error) {
        console.error('Error loading liquidGL:', error);
        setUseWebGL(false);
        setIsLoaded(true);
        onReady?.();
      }
    };

    initLiquidGL();

    return () => {
      mounted = false;
      if (liquidGLInstanceRef.current) {
        liquidGLInstanceRef.current.destroy();
        liquidGLInstanceRef.current = null;
      }
    };
  }, []);

  // Mettre à jour liquidGL quand les uniforms changent
  useEffect(() => {
    if (!useWebGL || !liquidGLInstanceRef.current || !window.liquidGL) return;

    try {
      const config = getLiquidGLConfig();
      // Note: liquidGL peut ne pas avoir de méthode update, donc on détruit et recrée
      if (liquidGLInstanceRef.current.destroy) {
        liquidGLInstanceRef.current.destroy();
      }
      
      setTimeout(() => {
        const instance = window.liquidGL!(config);
        liquidGLInstanceRef.current = instance;
      }, 50);
    } catch (error) {
      console.error('Error updating liquidGL:', error);
    }
  }, [uniforms, useWebGL, getLiquidGLConfig]);

  // Styles CSS fallback pour quand WebGL n'est pas disponible
  const cssStyles = {
    width: `${uniforms.width}px`,
    height: `${uniforms.height}px`,
    left: `${uniforms.mouseX - uniforms.width / 2}px`,
    top: `${uniforms.mouseY - uniforms.height / 2}px`,
    borderRadius: uniforms.shape === 'circle' 
      ? '50%' 
      : `${uniforms.cornerRadius}px`,
    boxShadow: `${uniforms.shadowOffsetX}px ${uniforms.shadowOffsetY}px ${
      uniforms.shadowBlur
    }px rgba(0,0,0,${uniforms.shadowIntensity})`,
    backdropFilter: `blur(${uniforms.blur * 10}px) saturate(${uniforms.saturation})`,
    WebkitBackdropFilter: `blur(${uniforms.blur * 10}px) saturate(${uniforms.saturation})`,
    backgroundColor: `rgba(${Math.round(uniforms.tintR * 255)}, ${Math.round(
      uniforms.tintG * 255
    )}, ${Math.round(uniforms.tintB * 255)}, ${uniforms.glassMode === 'dark' ? 0.15 : 0.25})`,
  };

  const iconColor = `rgb(${Math.round(uniforms.iconColorR * 255)}, ${Math.round(
    uniforms.iconColorG * 255
  )}, ${Math.round(uniforms.iconColorB * 255)})`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Élément cible pour liquidGL - doit être position: fixed ou absolute selon liquidGL */}
      <div
        ref={glassRef}
        className={`liquid-glass-target absolute transition-all duration-500 ${
          isTransitioning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
        }`}
        style={{
          ...cssStyles,
          // liquidGL nécessite un z-index élevé pour fonctionner correctement
          zIndex: 10,
          // S'assurer que l'élément est visible pour le snapshot
          visibility: isLoaded ? 'visible' : 'hidden',
        }}
      >
        {/* Contenu à l'intérieur du verre - z-index élevé pour être au-dessus du verre */}
        <div
          className="liquid-content relative w-full h-full flex items-center justify-center"
          style={{ zIndex: 3 }}
        >
          {uniforms.text && (
            <div
              className="select-none text-center pointer-events-none"
              style={{
                fontSize: `${Math.min(uniforms.width, uniforms.height) * uniforms.iconSize}px`,
                color: iconColor,
                textShadow:
                  uniforms.glassMode === 'dark'
                    ? '0 2px 12px rgba(0,0,0,0.6)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {uniforms.text}
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour effet supplémentaire si WebGL n'est pas utilisé */}
      {!useWebGL && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              ...cssStyles,
              background: `rgba(${Math.round(uniforms.tintR * 255)}, ${Math.round(
                uniforms.tintG * 255
              )}, ${Math.round(uniforms.tintB * 255)}, ${uniforms.glassMode === 'dark' ? 0.15 : 0.25})`,
              backdropFilter: `blur(${uniforms.blur * 10}px) saturate(${uniforms.saturation})`,
              WebkitBackdropFilter: `blur(${uniforms.blur * 10}px) saturate(${uniforms.saturation})`,
              zIndex: 1,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              ...cssStyles,
              background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 60%)`,
              mixBlendMode: uniforms.glassMode === 'dark' ? 'screen' : 'normal',
              opacity: 0.4,
              zIndex: 2,
            }}
          />
        </>
      )}
    </div>
  );
}

