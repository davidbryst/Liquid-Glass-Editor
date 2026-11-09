import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

/**
 * Composant générique pour afficher des icônes SVG personnalisées
 */
export function Icon({ name, size = 20, className = "", ...props }: IconProps) {
  // Import dynamique des icônes depuis le dossier icons
  const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    home: HouseIcon,
    edit: EditIcon,
    contact:  ContactIcon,
    random: RandomIcon,
    upload: UploadIcon,
    reset: ResetIcon,
    panel: PanelIcon,
    copy: CopyIcon,
  };

  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

// Définitions des icônes SVG personnalisées

function HouseIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h8v2H8z" />
      <path d="M8 12h8v2H8z" />
      <path d="M8 16h4v2H8z" />
    </svg>
  );
}
function EditIconD(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 21v-4a2 2 0 0 1 2-2h2.5a2 2 0 0 0 1.42-.59l7.09-7.09a2 2 0 0 0 0-2.83l-2.5-2.5a2 2 0 0 0-2.83 0l-7.09 7.09A2 2 0 0 0 3 11.5V14a2 2 0 0 0 2 2h4" />
      <path d="M17.5 6.5l-11 11" />
    </svg>
  );
}

function RandomIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M8.7 14.2c-.7.5-1.6.8-2.5.8H4a1 1 0 1 0 0 2h2.2c1.3 0 2.6-.4 3.7-1.2a1 1 0 0 0-.2-1.4c-.4-.5-1-.6-1.4-.2Z" />
      <path d="M13 10.7c.3 0 .6-.1.8-.3A6.75 6.75 0 0 1 16.8 9h.8l-.3.3a1 1 0 1 0 1.4 1.4l2-2c.1-.1.2-.2.2-.3.1-.2.1-.5 0-.8 0-.1-.1-.2-.2-.3l-2-2a1 1 0 0 0-1.4 1.4l.3.3h-.8c-1.8 0-3.4.8-4.6 2.1-.4.4-.3 1 .1 1.4.2.2.5.3.7.3Z" />
      <path d="M20.7 15.3l-2-2a1 1 0 0 0-1.4 1.4l.3.3h-1.5c-1.6 0-2.9-.9-3.6-2.3l-1.2-2.4C10.3 8.3 8.2 7 5.9 7H4a1 1 0 1 0 0 2h1.9c1.6 0 2.9.9 3.6 2.3l1.2 2.4c1 2.1 3.1 3.4 5.4 3.4h1.5l-.3.3a1 1 0 1 0 1.4 1.4l2-2c.4-.4.4-1 0-1.4Z" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M12 11v6" />
      <path d="m9 14 3-3 3 3" />
    </svg>
  );
}

function ResetIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function ContactIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a9 9 0 0 1 13 0" />
    </svg>
  );
}

function PanelIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <line x1="15" y1="5" x2="15" y2="19" />
    </svg>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
 
