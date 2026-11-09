import { Link } from "react-router";
import type { Route } from "./+types/contact";
import { Icon } from "~/components/icons/Icon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact" },
    { name: "description", content: "Contactez-nous pour toute question ou suggestion concernant Liquid Glass Editor." },
  ];
}

export default function Contact() {
  return (
    <main className="pt-16 p-4 container mx-auto flex flex-col items-center">
      <section className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-sm mt-7 p-8">
        <h1 className=" font-semibold mb-4 text-blue-700">Contact</h1>
        <p className="text-lg text-gray-700 mb-8">
          Pour toute question ou suggestion concernant Liquid Glass Editor, n’hésitez pas à nous contacter.
        </p>
        <Link
            to="/"
            className={`btn font-medium no-underline btn-primary`}
          >
            <Icon name="home" />
            Retour à l’accueil
          </Link>
      </section>
    </main>
  );
}


