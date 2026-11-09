# Système d'icônes SVG personnalisées

Ce dossier contient le système d'icônes SVG personnalisées pour l'application.

## Utilisation

```tsx
import { Icon } from "./components/icons/Icon";

// Utilisation basique
<Icon name="house" size={16} />

// Avec classes CSS personnalisées
<Icon name="penNib" size={20} className="text-blue-500" />
```

## Ajouter une nouvelle icône

1. Créez une fonction composant dans `Icon.tsx` :

```tsx
function MaNouvelleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Votre SVG ici */}
      <path d="..." />
    </svg>
  );
}
```

2. Ajoutez-la au `iconMap` dans le composant `Icon` :

```tsx
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // ... autres icônes
  maNouvelleIcon: MaNouvelleIcon,
};
```

3. Utilisez-la dans votre code :

```tsx
<Icon name="maNouvelleIcon" size={16} />
```

## Icônes disponibles

- `house` - Icône de maison
- `penNib` - Icône de stylo/éditeur
- `random` - Icône de mélange aléatoire
- `fileArrowUp` - Icône d'upload de fichier
- `rotateRight` - Icône de rotation/réinitialisation
- `addressBook` - Icône de carnet d'adresses
- `sliders` - Icône de paramètres/sliders

## Personnalisation

Toutes les icônes héritent des propriétés SVG standard et peuvent être personnalisées avec :
- `size` : Taille de l'icône (nombre ou string)
- `className` : Classes CSS pour le style
- Toutes les autres props SVG standard (`stroke`, `fill`, etc.)

