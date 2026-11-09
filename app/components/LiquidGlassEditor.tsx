import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import LiquidGlassShader from './LiquidGlassShader';
import { useEditorContext } from '~/lib/editor-context';
import { Icon } from './icons/Icon';

type GlassShape = 'rectangle' | 'circle' | 'star' | 'hexagon' | 'donut';

interface ShaderParams {
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
  shape: GlassShape;
  donutThickness: number;
  starPoints: number;
  starInnerRadius: number;
}

interface BackgroundMedia {
  url: string;
  type: 'image' | 'video';
  blurhash?: string;
}

interface CuratedImage {
  url: string;
  blurhash: string;
}

// Curated background images with pre-computed blurhash values
const BACKGROUND_IMAGES: CuratedImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1541869440787-abe7669a951a?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L6Adyj00_4WA?HRP%LIp4.%1x^t8'
  },
  {
    url: 'https://i0.wp.com/mrmacintosh.com/wp-content/uploads/2025/06/Screenshot-2025-06-09-at-3.49.32%E2%80%AFPM.png?w=1680&ssl=1',
    blurhash: 'LA9jZp4n~qIU_3M{RjWB4nofRjWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1738916218012-4e580beae18e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L58NK1$+0Kt6?aRkxvt6_ND%tRWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1745613184657-3c8dcd5f079a?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'LBF5UJo}~q%MWBM{Rjt7-;ofWBof'
  },
  {
    url: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L38gvD?a~V%M?bE2M{t79Ft6xuR+'
  },
  {
    url: 'https://images.unsplash.com/photo-1747738305509-6b21c67ec6f6?q=80&w=3136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'LHCP~5%M~qM{%Mt7IUay-;ofayWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1585541116655-556ec2621aef?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'LHCP~5%M~qM{%Mt7IUay-;ofayWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1543604502-9baac28067ad?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'LHCP~5%M~qM{%Mt7IUay-;ofayWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1568733873715-f9d497a47ea0?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L59%{8Rj~qD%00M{ofj[_3xuM{Rj'
  },
  {
    url: 'https://images.unsplash.com/photo-1508614999368-9260051292e5?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L79QJa9F~qRj00%1Rjt7-;WBRjWB'
  },
  {
    url: 'https://images.unsplash.com/photo-1724748860101-589aa7ee8b29?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L6A,]q%M~q%M00WAWBIU_3xtRjRP'
  },
  {
    url: 'https://images.unsplash.com/photo-1730854476441-f492868dcfb0?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L8A0}G%M~qRj00%1Rjof-;j@M{RP'
  },
  {
    url: 'https://images.unsplash.com/photo-1640329255807-bee8f74893fa?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L7A9U5Io~V%M_2%LM{of-;ofayof'
  },
  {
    url: 'https://images.unsplash.com/photo-1669808219008-da86478560e2?q=80&w=3067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L8D,}8~W_3%M00WBWBIU4.j[M{RP'
  },
  {
    url: 'https://images.unsplash.com/photo-1728140842863-674c0c66e9e0?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L6C?}@~W_3%M00WBWBIU4.j[M{RP'
  },
  {
    url: 'https://images.unsplash.com/photo-1729606054134-15eb9c32f994?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'L5A0}G%M~qRj00%1Rjof-;j@M{RP'
  }
];

const DEFAULT_BACKGROUND_IMAGE = BACKGROUND_IMAGES[0];

// Shape options for the selector
const SHAPE_OPTIONS = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'star', label: 'Star' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'donut', label: 'Donut' }
] as const;

// Browser detection utility
const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('Safari') && !userAgent.includes('Chrome');
};

// Font detection utility
const detectSFFont = (): boolean => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;

  const testString = 'abcdefghijklmnopqrstuvwxyz';
  const fontSize = '72px';
  
  context.font = `${fontSize} monospace`;
  const fallbackWidth = context.measureText(testString).width;
  
  context.font = `${fontSize} "SF Pro Display", -apple-system, system-ui`;
  const sfWidth = context.measureText(testString).width;
  
  return Math.abs(sfWidth - fallbackWidth) > 1;
};

// Get default text based on browser and font support
const getDefaultText = (): string => {
  if (typeof window === 'undefined') return '✨';
  
  if (isSafari()) return '✨';
  
  return detectSFFont() ? '􀅼' : '✨';
};

// Default shader parameters
const DEFAULT_PARAMS: ShaderParams = {
  width: 200,
  height: 100,
  mouseX: 0,
  mouseY: 0,
  tintR: 0.968,
  tintG: 1.0,
  tintB: 0.878,
  saturation: 1.0,
  distortion: 2.0,
  blur: 2.5,
  text: getDefaultText(),
  iconSize: 0.25,
  iconColorR: 1.0,
  iconColorG: 1.0,
  iconColorB: 1.0,
  glassMode: 'light',
  shadowIntensity: 0.25,
  shadowOffsetX: 3,
  shadowOffsetY: 3,
  shadowBlur: 20,
  cornerRadius: 50,
  chromaticAberration: 0.8,
  shape: 'rectangle',
  donutThickness: 0.3,
  starPoints: 5,
  starInnerRadius: 0.4
};

// Image preloading for better performance
const preloadImages = () => {
  BACKGROUND_IMAGES.forEach((image) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.url;
  });
};

export default function LiquidGlassEditor() {
  const [backgroundMedia, setBackgroundMedia] = useState<BackgroundMedia>({
    url: DEFAULT_BACKGROUND_IMAGE.url,
    type: 'image',
    blurhash: DEFAULT_BACKGROUND_IMAGE.blurhash
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextImage, setNextImage] = useState<CuratedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGlassDragging, setIsGlassDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<ShaderParams>(() => ({
    ...DEFAULT_PARAMS,
    text: getDefaultText()
  }));

  // Preload images on mount
  useEffect(() => {
    preloadImages();
  }, []);

  // Memoize color conversion utilities
  const colorUtils = useMemo(() => ({
    rgbToHex: (r: number, g: number, b: number) => {
      const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    },
    
    hexToRgb: (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        : { r: 1, g: 1, b: 1 };
    }
  }), []);

  // Memoize shader uniforms
  const shaderUniforms = useMemo(() => ({
    time: 0,
    ...params
  }), [params]);

  // Initialize glass position to center
  const centerGlass = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setParams(prev => ({
        ...prev,
        mouseX: rect.width / 2,
        mouseY: rect.height / 2
      }));
    }
  }, []);

  useEffect(() => {
    centerGlass();
  }, [centerGlass]);

  // Recenter glass when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(centerGlass, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen, centerGlass]);

  const handleCanvasReady = useCallback(() => {
    setIsCanvasReady(true);
    setTimeout(() => {
      setIsTextVisible(true);
    }, 400);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setBackgroundMedia({
          url,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const resetParams = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;
    
    setIsTransitioning(true);
    setNextImage(DEFAULT_BACKGROUND_IMAGE);
    
    setBackgroundMedia({
      url: DEFAULT_BACKGROUND_IMAGE.url,
      type: 'image',
      blurhash: DEFAULT_BACKGROUND_IMAGE.blurhash
    });
    
    setParams({
      ...DEFAULT_PARAMS,
      text: getDefaultText(),
      mouseX: centerX,
      mouseY: centerY
    });
    
    setTimeout(() => {
      setCurrentImageIndex(0);
      setIsTransitioning(false);
      setNextImage(null);
    }, 100);
  }, []);

  // Parameter update function
  const updateParam = useCallback((key: keyof ShaderParams, value: number | string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Color change handlers
  const handleIconColorChange = useCallback((hex: string) => {
    const rgb = colorUtils.hexToRgb(hex);
    setParams(prev => ({
      ...prev,
      iconColorR: rgb.r,
      iconColorG: rgb.g,
      iconColorB: rgb.b
    }));
  }, [colorUtils]);

  const handleTintColorChange = useCallback((hex: string) => {
    const rgb = colorUtils.hexToRgb(hex);
    setParams(prev => ({
      ...prev,
      tintR: rgb.r,
      tintG: rgb.g,
      tintB: rgb.b
    }));
  }, [colorUtils]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      setIsGlassDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setParams(prev => ({ ...prev, mouseX: x, mouseY: y }));
    }
  }, [isDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isGlassDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setParams(prev => ({ ...prev, mouseX: x, mouseY: y }));
    }
  }, [isGlassDragging]);

  const handleMouseUp = useCallback(() => {
    setIsGlassDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsGlassDragging(false);
  }, []);

  const handleRandomImage = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % BACKGROUND_IMAGES.length;
    const nextImageData = BACKGROUND_IMAGES[nextIndex];
    
    setIsTransitioning(true);
    setNextImage(nextImageData);
    
    setBackgroundMedia({
      url: nextImageData.url,
      type: 'image',
      blurhash: nextImageData.blurhash
    });
    
    setParams(prev => ({
      ...prev,
      tintR: 1.0,
      tintG: 1.0,
      tintB: 1.0,
      saturation: 1.0
    }));
    
    setTimeout(() => {
      setCurrentImageIndex(nextIndex);
      setIsTransitioning(false);
      setNextImage(null);
    }, 100);
  }, [currentImageIndex]);

  // Register handlers with editor context
  const { 
    registerRandomHandler,
    registerUploadHandler,
    registerResetHandler,
    registerToggleSidebarHandler,
    registerBackgroundMedia
  } = useEditorContext();

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const rgbToHex = useCallback((r: number, g: number, b: number) => {
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  const generateCode = useCallback(() => {
    const iconColor = rgbToHex(params.iconColorR, params.iconColorG, params.iconColorB);
    const tintColor = rgbToHex(params.tintR, params.tintG, params.tintB);

    const code = `/* Liquid Glass Effect - CSS */
.liquid-glass {
  width: ${params.width}px;
  height: ${params.height}px;
  position: relative;
  border-radius: ${params.cornerRadius}px;
  overflow: hidden;
  backdrop-filter: blur(${params.blur * 10}px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: ${params.shadowOffsetX}px ${params.shadowOffsetY}px ${params.shadowBlur}px rgba(0, 0, 0, ${params.shadowIntensity});
  filter: saturate(${params.saturation});
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border-radius: ${params.cornerRadius}px;
  pointer-events: none;
}

/* React Component Props */
const glassProps = {
  width: ${params.width},
  height: ${params.height},
  shape: '${params.shape}',
  cornerRadius: ${params.cornerRadius},
  blur: ${params.blur},
  distortion: ${params.distortion},
  saturation: ${params.saturation},
  tintColor: '${tintColor}',
  iconColor: '${iconColor}',
  iconSize: ${params.iconSize},
  iconText: '${params.text}',
  shadowIntensity: ${params.shadowIntensity},
  shadowOffsetX: ${params.shadowOffsetX},
  shadowOffsetY: ${params.shadowOffsetY},
  shadowBlur: ${params.shadowBlur},
  chromaticAberration: ${params.chromaticAberration},
  glassMode: '${params.glassMode}',
  ${params.shape === 'donut' ? `donutThickness: ${params.donutThickness},` : ''}
  ${params.shape === 'star' ? `starPoints: ${params.starPoints},\n  starInnerRadius: ${params.starInnerRadius},` : ''}
};`;

    return code;
  }, [params, rgbToHex]);

  const handleCopyCode = useCallback(async () => {
    try {
      const code = generateCode();
      await navigator.clipboard.writeText(code);
      alert('Code copié dans le presse-papiers !');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      const textArea = document.createElement('textarea');
      textArea.value = generateCode();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Code copié dans le presse-papiers !');
    }
  }, [generateCode]);

  // Register background media in context
  useEffect(() => {
    registerBackgroundMedia(backgroundMedia);
  }, [backgroundMedia, registerBackgroundMedia]);

  useEffect(() => {
    registerRandomHandler(handleRandomImage);
    registerUploadHandler(handleUploadClick);
    registerResetHandler(resetParams);
    registerToggleSidebarHandler(handleToggleSidebar);
  }, [
    registerRandomHandler,
    registerUploadHandler,
    registerResetHandler,
    registerToggleSidebarHandler,
    handleRandomImage,
    handleUploadClick,
    resetParams,
    handleToggleSidebar
  ]);

  const handleSelectBackground = useCallback((index: number) => {
    const selectedImage = BACKGROUND_IMAGES[index];
    
    setIsTransitioning(true);
    setNextImage(selectedImage);
    
    setBackgroundMedia({
      url: selectedImage.url,
      type: 'image',
      blurhash: selectedImage.blurhash
    });
    
    setParams(prev => ({
      ...prev,
      tintR: 1.0,
      tintG: 1.0,
      tintB: 1.0,
      saturation: 1.0
    }));
    
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
      setNextImage(null);
    }, 100);
  }, []);

  // Memoize background thumbnails
  const backgroundThumbnails = useMemo(() => (
    BACKGROUND_IMAGES.map((image, index) => (
      <button
        key={index}
        onClick={() => handleSelectBackground(index)}
        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
          currentImageIndex === index 
            ? 'border-blue-500 shadow-md' 
            : 'border-gray-300 hover:border-blue-300'
        }`}
      >
        <img
          src={`${image.url}&w=100&h=100&fit=crop`}
          alt={`Background ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {currentImageIndex === index && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          </div>
        )}
      </button>
    ))
  ), [currentImageIndex, handleSelectBackground]);

  // Memoize text overlay style
  const textOverlayStyle = useMemo(() => ({
    left: params.mouseX,
    top: params.mouseY,
    transform: 'translate(-50%, -50%)',
    fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize: Math.min(params.width, params.height) * params.iconSize,
    fontWeight: 400,
    textShadow: params.glassMode === 'dark' 
      ? '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.1)' 
      : '0 1px 3px rgba(0,0,0,0.3)',
    zIndex: 10,
    color: `rgb(${Math.round(params.iconColorR * 255)}, ${Math.round(params.iconColorG * 255)}, ${Math.round(params.iconColorB * 255)})`,
    transitionDelay: isTextVisible ? '0ms' : '0ms'
  }), [params, isTextVisible]);

  // Memoize preview text overlay style
  const previewTextOverlayStyle = useMemo(() => {
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    const leftPercent = (params.mouseX / canvasWidth) * 100;
    const topPercent = (params.mouseY / canvasHeight) * 100;
    
    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      transform: 'translate(-50%, -50%)',
      fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontSize: `${Math.min(params.width, params.height) * params.iconSize}px`,
      fontWeight: 400,
      textShadow: params.glassMode === 'dark' 
        ? '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.1)' 
        : '0 1px 3px rgba(0,0,0,0.3)',
      zIndex: 10,
      color: `rgb(${Math.round(params.iconColorR * 255)}, ${Math.round(params.iconColorG * 255)}, ${Math.round(params.iconColorB * 255)})`,
    };
  }, [params]);

  // Drag handlers
  const dragHandlers = useMemo(() => ({
    onDrop: handleDrop,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave
  }), [handleDrop, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);

  // Shape-specific controls visibility
  const showCornerRadius = params.shape === 'rectangle';
  const showDonutThickness = params.shape === 'donut';
  const showStarPoints = params.shape === 'star';
  const showStarInnerRadius = params.shape === 'star';

  // Simple slider component
  const Slider = ({ value, onChange, min, max, step = 1, label, displayValue }: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label: string;
    displayValue?: string | number;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );

  // Simple color picker component
  const ColorPicker = ({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="h-[80vh] bg-transparent flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-hidden rounded-2xl">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 p-3 flex flex-col">
            <div className="flex-1 p-3 flex flex-col bg-transparent rounded-lg shadow-sm">
              <div
                ref={canvasRef}
                className={`relative w-full flex-1 rounded-lg overflow-hidden select-none ${
                  isGlassDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                {...dragHandlers}
              >
                <LiquidGlassShader
                  uniforms={shaderUniforms}
                  className="w-full h-full"
                  isTransitioning={isTransitioning}
                  onReady={handleCanvasReady}
                />
                
                <div 
                  className={`absolute inset-0 bg-white/80 backdrop-blur-2xl transition-opacity duration-700 ease-out pointer-events-none ${
                    isCanvasReady ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                
                {params.text && (
                  <div 
                    className={`absolute pointer-events-none select-none transition-opacity duration-800 ease-out ${
                      isTextVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={textOverlayStyle}
                  >
                    {params.text}
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div 
          className={`absolute flex justify-end top-2 right-0 h-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out z-20 bg-black/20 ${
            isSidebarOpen ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`} 
          onClick={handleToggleSidebar}
        >
          <div
            className="h-[98%] flex flex-col w-[320px] bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto px-4 py-5 text-gray-700">
              {/* Background Gallery */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Backgrounds</h3>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundThumbnails}
                </div>
              </div>

              {/* Glass Shape */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Glass Shape</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Shape</label>
                    <select
                      value={params.shape}
                      onChange={(e) => updateParam('shape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {SHAPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Symbol</label>
                    <input
                      type="text"
                      value={params.text}
                      onChange={(e) => updateParam('text', e.target.value)}
                      placeholder="Enter SF symbol or text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">SF symbol or custom text inside glass</p>
                  </div>
                  
                  <Slider
                    label="Icon Size"
                    value={params.iconSize}
                    onChange={(value) => updateParam('iconSize', value)}
                    min={0.1}
                    max={0.8}
                    step={0.05}
                    displayValue={`${(params.iconSize * 100).toFixed(0)}%`}
                  />
                  
                  <Slider
                    label="Width"
                    value={params.width}
                    onChange={(value) => updateParam('width', value)}
                    min={50}
                    max={500}
                    step={5}
                    displayValue={`${params.width}px`}
                  />
                  
                  <Slider
                    label="Height"
                    value={params.height}
                    onChange={(value) => updateParam('height', value)}
                    min={50}
                    max={500}
                    step={5}
                    displayValue={`${params.height}px`}
                  />
                  
                  {showCornerRadius && (
                    <Slider
                      label="Corner Radius"
                      value={params.cornerRadius}
                      onChange={(value) => updateParam('cornerRadius', value)}
                      min={0}
                      max={170}
                      step={5}
                      displayValue={`${params.cornerRadius}px`}
                    />
                  )}

                  {showDonutThickness && (
                    <Slider
                      label="Thickness"
                      value={params.donutThickness}
                      onChange={(value) => updateParam('donutThickness', value)}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      displayValue={`${(params.donutThickness * 100).toFixed(0)}%`}
                    />
                  )}

                  {showStarPoints && (
                    <Slider
                      label="Star Points"
                      value={params.starPoints}
                      onChange={(value) => updateParam('starPoints', value)}
                      min={3}
                      max={12}
                      step={1}
                    />
                  )}

                  {showStarInnerRadius && (
                    <Slider
                      label="Inner Radius"
                      value={params.starInnerRadius}
                      onChange={(value) => updateParam('starInnerRadius', value)}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      displayValue={`${(params.starInnerRadius * 100).toFixed(0)}%`}
                    />
                  )}
                </div>
              </div>

              {/* Glass Properties */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Glass Properties</h3>
                <div className="space-y-4">
                  <Slider
                    label="Saturation"
                    value={params.saturation}
                    onChange={(value) => updateParam('saturation', value)}
                    min={0.0}
                    max={1.2}
                    step={0.05}
                    displayValue={params.saturation.toFixed(2)}
                  />
                  
                  <Slider
                    label="Distortion"
                    value={params.distortion}
                    onChange={(value) => updateParam('distortion', value)}
                    min={0}
                    max={3}
                    step={0.1}
                    displayValue={params.distortion.toFixed(1)}
                  />
                  
                  <Slider
                    label="Blur"
                    value={params.blur}
                    onChange={(value) => updateParam('blur', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    displayValue={params.blur.toFixed(1)}
                  />
                  
                  <Slider
                    label="Chromatic Aberration"
                    value={params.chromaticAberration}
                    onChange={(value) => updateParam('chromaticAberration', value)}
                    min={0.0}
                    max={4.0}
                    step={0.1}
                    displayValue={params.chromaticAberration.toFixed(1)}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Color</h3>
                <div className="space-y-4">
                  <ColorPicker
                    label="Icon Color"
                    value={colorUtils.rgbToHex(params.iconColorR, params.iconColorG, params.iconColorB)}
                    onChange={handleIconColorChange}
                  />
                  
                  <ColorPicker
                    label="Glass Tint"
                    value={colorUtils.rgbToHex(params.tintR, params.tintG, params.tintB)}
                    onChange={handleTintColorChange}
                  />
                </div>
              </div>

              {/* Shadow */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Shadow</h3>
                <div className="space-y-4">
                  <Slider
                    label="Intensity"
                    value={params.shadowIntensity}
                    onChange={(value) => updateParam('shadowIntensity', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    displayValue={`${(params.shadowIntensity * 100).toFixed(0)}%`}
                  />
                  
                  <Slider
                    label="Offset X"
                    value={params.shadowOffsetX}
                    onChange={(value) => updateParam('shadowOffsetX', value)}
                    min={-30}
                    max={30}
                    step={1}
                    displayValue={`${params.shadowOffsetX}px`}
                  />
                  
                  <Slider
                    label="Offset Y"
                    value={params.shadowOffsetY}
                    onChange={(value) => updateParam('shadowOffsetY', value)}
                    min={-30}
                    max={30}
                    step={1}
                    displayValue={`${params.shadowOffsetY}px`}
                  />
                  
                  <Slider
                    label="Blur"
                    value={params.shadowBlur}
                    onChange={(value) => updateParam('shadowBlur', value)}
                    min={0}
                    max={30}
                    step={1}
                    displayValue={`${params.shadowBlur}px`}
                  />
                </div>
              </div>

              {/* Code Preview & Copy */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="copy" size={16} />
                  Prévisualiser le code
                </button>
                
                {isPreviewOpen && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-900">Aperçu du rendu</h4>
                      <div 
                        ref={previewCanvasRef}
                        className="relative rounded-lg overflow-hidden bg-gray-100"
                        style={{
                          width: '100%',
                          aspectRatio: '16/9',
                          minHeight: '200px',
                        }}
                      >
                        <LiquidGlassShader
                          uniforms={shaderUniforms}
                          className="w-full h-full"
                          isTransitioning={false}
                        />
                        {params.text && (
                          <div 
                            className="absolute pointer-events-none select-none"
                            style={previewTextOverlayStyle}
                          >
                            {params.text}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">Code généré</h4>
                        <button
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Icon name="copy" size={14} />
                          Copier
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[300px] overflow-y-auto">
                        <code>{generateCode()}</code>
                      </pre>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleCopyCode}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="copy" size={16} />
                  Copier le code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
