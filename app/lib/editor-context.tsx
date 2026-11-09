import { createContext, useContext, useState, useCallback, type ReactNode,  } from 'react';

interface BackgroundMedia {
  url: string;
  type: 'image' | 'video';
  blurhash?: string;
}

interface EditorContextType {
  triggerRandomImage: () => void;
  triggerUpload: () => void;
  triggerReset: () => void;
  triggerToggleSidebar: () => void;
  registerRandomHandler: (handler: () => void) => void;
  registerUploadHandler: (handler: () => void) => void;
  registerResetHandler: (handler: () => void) => void;
  registerToggleSidebarHandler: (handler: () => void) => void;
  backgroundMedia: BackgroundMedia | null;
  registerBackgroundMedia: (media: BackgroundMedia) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [randomHandler, setRandomHandler] = useState<(() => void) | null>(null);
  const [uploadHandler, setUploadHandler] = useState<(() => void) | null>(null);
  const [resetHandler, setResetHandler] = useState<(() => void) | null>(null);
  const [toggleSidebarHandler, setToggleSidebarHandler] = useState<(() => void) | null>(null);
  const [backgroundMedia, setBackgroundMedia] = useState<BackgroundMedia | null>(null);

  const registerRandomHandler = useCallback((handler: () => void) => {
    setRandomHandler(() => handler);
  }, []);

  const registerUploadHandler = useCallback((handler: () => void) => {
    setUploadHandler(() => handler);
  }, []);

  const registerResetHandler = useCallback((handler: () => void) => {
    setResetHandler(() => handler);
  }, []);

  const registerToggleSidebarHandler = useCallback((handler: () => void) => {
    setToggleSidebarHandler(() => handler);
  }, []);

  const registerBackgroundMedia = useCallback((media: BackgroundMedia) => {
    setBackgroundMedia(media);
  }, []);

  const triggerRandomImage = useCallback(() => {
    if (randomHandler) {
      randomHandler();
    }
  }, [randomHandler]);

  const triggerUpload = useCallback(() => {
    if (uploadHandler) {
      uploadHandler();
    }
  }, [uploadHandler]);

  const triggerReset = useCallback(() => {
    if (resetHandler) {
      resetHandler();
    }
  }, [resetHandler]);

  const triggerToggleSidebar = useCallback(() => {
    if (toggleSidebarHandler) {
      toggleSidebarHandler();
    }
  }, [toggleSidebarHandler]);

  return (
    <EditorContext.Provider value={{ 
      triggerRandomImage,
      triggerUpload,
      triggerReset,
      triggerToggleSidebar,
      registerRandomHandler,
      registerUploadHandler,
      registerResetHandler,
      registerToggleSidebarHandler,
      backgroundMedia,
      registerBackgroundMedia
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider');
  }
  return context;
}

