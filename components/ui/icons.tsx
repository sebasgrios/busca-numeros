import type { SVGProps } from "react";

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, "children" | "mode"> {
  size?: number;
}

type Mode = "stroke" | "fill" | "mixed";

interface IconBaseProps extends IconProps {
  mode?: Mode;
  children: React.ReactNode;
}

/**
 * Envoltorio base de los iconos SVG del juego. Trazos gruesos y
 * redondeados para encajar con el estilo candy del diseño.
 */
function IconBase({
  size = 24,
  mode = "stroke",
  children,
  ...rest
}: IconBaseProps) {
  const stroke = mode === "fill" ? "none" : "currentColor";
  const fill = mode === "stroke" ? "none" : "currentColor";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </IconBase>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <IconBase mode="fill" {...props}>
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
    </IconBase>
  );
}

export function IconCog(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </IconBase>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </IconBase>
  );
}

export function IconX(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 6.5h17M9 6.5V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v2M5.5 6.5l1.2 13.1a2 2 0 0 0 2 1.9h6.6a2 2 0 0 0 2-1.9l1.2-13.1M10 11v6M14 11v6" />
    </IconBase>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <IconBase mode="fill" {...props}>
      <path d="M7.5 5.3a1 1 0 0 1 1.52-.86l11.2 6.7a1 1 0 0 1 0 1.72l-11.2 6.7A1 1 0 0 1 7.5 18.7Z" />
    </IconBase>
  );
}

export function IconTrophy(props: IconProps) {
  return (
    <IconBase mode="mixed" {...props}>
      {/* asas */}
      <path d="M6 5H3v3a4 4 0 0 0 4 4M18 5h3v3a4 4 0 0 1-4 4" fill="none" />
      {/* copa */}
      <path d="M6 3.5h12v5.5a6 6 0 1 1-12 0Z" />
      {/* pie */}
      <path d="M10 15.5h4v3h-4zM7 21h10" fill="none" />
    </IconBase>
  );
}

export function IconSwords(props: IconProps) {
  return (
    <IconBase {...props}>
      {/* espada 1: desde top-right hasta center-low + mango */}
      <path d="M20.5 3.5h-3.6l-9 9 3.6 3.6 9-9zM15 14.5l4 4M16.5 19.5l3 1 1-1-1-3" />
      {/* espada 2: desde top-left hasta center-low + mango */}
      <path d="M3.5 3.5h3.6l5.4 5.4M9 14.5l-4 4M7.5 19.5l-3 1-1-1 1-3" />
    </IconBase>
  );
}

export function IconKey(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="7.5" cy="14.5" r="3.5" />
      <path d="M10.5 12 21 3.5M17.5 7l2.5 2.5M14.5 10l2 2" />
    </IconBase>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 4v5h-5" />
    </IconBase>
  );
}

export function IconStopwatch(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.5 2h5M12 4.5V2" />
      <path d="M19 6l1.5-1.5M5 6 3.5 4.5" />
      <circle cx="12" cy="14" r="7.5" />
      <path d="M12 10.5V14l2.5 2" />
    </IconBase>
  );
}

export function IconSmile(props: IconProps) {
  return (
    <IconBase mode="mixed" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5s1.4 2 3.5 2 3.5-2 3.5-2" fill="none" stroke="#fff" />
      <circle cx="9" cy="10.5" r="1.1" fill="#fff" stroke="none" />
      <circle cx="15" cy="10.5" r="1.1" fill="#fff" stroke="none" />
    </IconBase>
  );
}

export function IconPerson(props: IconProps) {
  return (
    <IconBase mode="fill" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0v.5h-15z" />
    </IconBase>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M16 5.5A2.5 2.5 0 0 0 13.5 3h-7A2.5 2.5 0 0 0 4 5.5v9A2.5 2.5 0 0 0 6.5 17H8" />
    </IconBase>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

export function IconStar(props: IconProps) {
  return (
    <IconBase mode="fill" {...props}>
      <path d="M12 2.5l2.9 5.9 6.6.95-4.8 4.65 1.13 6.55L12 17.85l-5.83 2.7L7.3 14l-4.8-4.65 6.6-.95Z" />
    </IconBase>
  );
}
