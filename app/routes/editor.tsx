import LiquidGlassEditor from "~/components/LiquidGlassEditor";
import { useEditorContext } from "~/lib/editor-context";
import type { Route } from "./+types/editor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Éditeur" },
    { name: "description", content: "Éditez vos projets avec Liquid Glass Editor" },
  ];
}

export default function Editor() {
  const { backgroundMedia } = useEditorContext();
  
  return (
    <main className="mt-4 pt-16 p-0 flex flex-col items-center px-2	">
      <section 
        className="w-full container mx-auto max-w-6xl border border-gray-200 rounded-2xl shadow-sm mt-2.5 p-2 relative overflow-hidden"
        style={{
          // backgroundImage: backgroundMedia?.url ? `url(${backgroundMedia.url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* <h1 className="text-4xl font-semibold mb-4 text-blue-700">Éditeur</h1>
        <p className="text-lg text-gray-700 mb-6">
          Éditez vos projets avec Liquid Glass Editor en toute simplicité.
        </p> */}
        
        <div className="">
          <LiquidGlassEditor />
        </div>
      </section>
    </main>
  );
}


