import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Icon } from "~/components/icons/Icon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Accueil" },
    { name: "description", content: "Bienvenue sur Liquid Glass Editor" },
  ];
}

export default function Home() {
  return (
    <main className=" pt-16 p-4 container mx-auto flex flex-col items-center">
      <section className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-sm mt-7 p-8">
        <h1 className="font-semibold mb-4 text-blue-700">
          Bienvenue sur Liquid Glass Editor
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Liquid Glass Editor est un éditeur moderne pour vos documents, conçu pour être rapide, intuitif et élégant.
          Commencez à créer ou modifiez vos projets en toute simplicité !
        </p>
        <div className="flex justify-start gap-4">
          <Link
            to="/editor"

            className={`btn font-medium no-underline btn-primary`}
          >
            <Icon name="edit" size={20} />	
            Accéder à l’éditeur
          </Link>
          <Link
            to="/contact"

            className={`btn font-medium no-underline btn-secondary`}
          >
            <Icon name="contact" size={20} />
            Contact
          </Link>
        </div>
        
      </section>
    </main>
  );
}
