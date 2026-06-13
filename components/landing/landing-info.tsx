import type { ComponentType } from "react";
import {
  IconCog,
  IconMoon,
  IconPlay,
  IconSmile,
  IconStar,
  IconStopwatch,
  IconSwords,
  IconTrophy,
  type IconProps,
} from "@/components/ui/icons";
import styles from "./landing-info.module.css";

type IconComponent = ComponentType<IconProps>;

interface Step {
  color: string;
  title: string;
  text: string;
}

interface Mode {
  color: string;
  icon: IconComponent;
  title: string;
  text: string;
}

interface Size {
  name: string;
  count: string;
}

interface Feature {
  icon: IconComponent;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    color: "var(--coral)",
    title: "Memoriza el orden",
    text: "Echa un vistazo a la cuadrícula desordenada del 1 al N y graba la secuencia en tu cabeza.",
  },
  {
    color: "var(--sky)",
    title: "Toca en secuencia",
    text: "Pulsa los números en orden empezando por el 1. Cada acierto se ilumina con un color.",
  },
  {
    color: "var(--sun)",
    title: "Sin pistas",
    text: "No hay indicador del siguiente número: solo la barra de progreso. Tu memoria contra el reloj.",
  },
];

const MODES: Mode[] = [
  {
    color: "var(--coral)",
    icon: IconStopwatch,
    title: "Cuenta atrás",
    text: "Tiempo limitado. Cada error te resta 3 segundos.",
  },
  {
    color: "var(--lavender)",
    icon: IconTrophy,
    title: "Clásico",
    text: "Cronómetro al alza. Un solo fallo y pierdes.",
  },
  {
    color: "var(--mint)",
    icon: IconSmile,
    title: "Relax",
    text: "Sin presión ni penalización. Solo tú y los números.",
  },
];

const SIZES: Size[] = [
  { name: "5 × 5", count: "25 números" },
  { name: "7 × 7", count: "49 números" },
  { name: "10 × 10", count: "100 números" },
];

const FEATURES: Feature[] = [
  {
    icon: IconTrophy,
    title: "Récords personales",
    text: "Top 20 por cada combinación de grid, modo y duración.",
  },
  {
    icon: IconSwords,
    title: "Multijugador",
    text: "Reta a tus amigos: hasta 4 jugadores por sala con código.",
  },
  {
    icon: IconMoon,
    title: "Modo oscuro",
    text: "Cambia el tema de toda la app desde Ajustes.",
  },
  {
    icon: IconCog,
    title: "Cuadrícula adaptable",
    text: "Se ajusta sola a cualquier tamaño de pantalla.",
  },
];

/**
 * Columna izquierda de la landing (solo escritorio, ≥860px): marca,
 * hero, recomendación de móvil, cómo se juega, modos, tamaños de grid,
 * características y footer. Panel con scroll propio.
 */
export function LandingInfo() {
  return (
    <aside className={styles.info}>
      <div className={styles.inner}>
        <div className={styles.brandRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.logo}
            src="/logo-icon.svg"
            alt="BuscaNúmeros"
            width={52}
            height={52}
          />
          <span className={styles.brandName}>BuscaNúmeros</span>
        </div>

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Memoriza el orden.
            <br />
            Toca los <span className={styles.accent}>números</span> en secuencia.
          </h1>
          <p className={styles.heroText}>
            Un juego de memoria y velocidad. Ve la cuadrícula, recuerda la
            posición y pulsa del 1 al último número lo más rápido que puedas.
            ¿Listo para batir tu récord?
          </p>
          <div className={styles.heroHint}>
            <span className={styles.heroHintArrow}>
              <IconPlay size={16} />
            </span>
            Juega aquí mismo, a tu derecha
          </div>
        </header>

        <div className={styles.tip}>
          <span className={styles.tipIcon}>
            <IconStar size={22} />
          </span>
          <span className={styles.tipText}>
            <b>Para una experiencia óptima, juega en tu móvil.</b> El tablero
            está pensado para tocarlo con el dedo — ahí es donde BuscaNúmeros
            brilla de verdad.
          </span>
        </div>

        <section className={styles.section}>
          <p className={styles.kicker}>Cómo se juega</p>
          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div className={styles.step} key={step.title}>
                <div
                  className={styles.stepNum}
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>Tres modos de juego</p>
          <div className={styles.modes}>
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <div className={styles.mode} key={mode.title}>
                  <div
                    className={styles.modeChip}
                    style={{ background: mode.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.modeTitle}>{mode.title}</h3>
                  <p className={styles.modeText}>{mode.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>Elige tu reto</p>
          <div className={styles.sizes}>
            {SIZES.map((size) => (
              <div className={styles.size} key={size.name}>
                {size.name} <small>{size.count}</small>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>Además</p>
          <div className={styles.features}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className={styles.feature} key={feature.title}>
                  <div className={styles.featureIcon}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>
            BuscaNúmeros · Hecho por{" "}
            <a
              href="https://sebasgrios.es"
              target="_blank"
              rel="noopener noreferrer"
            >
              SebasGRios
            </a>
          </span>
          <span>Memoriza · Toca · Repite</span>
        </footer>
      </div>
    </aside>
  );
}
