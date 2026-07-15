import { styles } from './SectionHeading.styles';

interface SectionHeadingProps {
  /** Código de registro a la izquierda (p. ej. "REG. 01"). */
  label: string;
  title: string;
  /** Texto opcional alineado a la derecha. */
  aside?: string;
  /** Nivel semántico del encabezado: 1 para el título de página, 2 para secciones. */
  level?: 1 | 2;
  /** Oculta el texto lateral por debajo de sm. */
  asideOnlyDesktop?: boolean;
}

/** Cabecera de sección: código de registro, título e info lateral. */
export function SectionHeading({
  label,
  title,
  aside,
  level = 2,
  asideOnlyDesktop = false,
}: SectionHeadingProps) {
  const Title = level === 1 ? 'h1' : 'h2';
  return (
    <div data-component="section-heading" className={styles.root}>
      <span className={styles.label}>{label}</span>
      <Title className={styles.title[level]}>{title}</Title>
      {aside ? (
        <span className={`${styles.aside} ${asideOnlyDesktop ? 'hidden sm:inline' : ''}`}>
          {aside}
        </span>
      ) : null}
    </div>
  );
}
