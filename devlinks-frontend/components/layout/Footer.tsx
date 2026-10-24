import Image from "next/image";
import Link from "next/link";

import { BrandIcon, type Brand } from "@/components/layout/BrandIcon";

const REPO_URL = "https://github.com/Nova11-Labs/devlinks";

const NAV = [
  {
    title: "Producto",
    links: [
      { label: "Crear mi DevLink", href: "/register", external: false },
      { label: "Ingresar", href: "/login", external: false },
      { label: "Precios", href: "/#precios", external: false },
      { label: "Preguntas frecuentes", href: "/#faq", external: false },
    ],
  },
  {
    title: "Proyecto",
    links: [
      { label: "Código en GitHub", href: REPO_URL, external: true },
      {
        label: "Reportar un problema",
        href: `${REPO_URL}/issues`,
        external: true,
      },
    ],
  },
];

const SOCIALS: { label: string; icon: Brand; href: string }[] = [
  { label: "GitHub", icon: "github", href: "https://github.com" },
  { label: "X", icon: "x", href: "https://x.com" },
  { label: "Discord", icon: "discord", href: "https://discord.com" },
  { label: "LinkedIn", icon: "linkedin", href: "https://linkedin.com" },
];

const linkClass =
  "rounded-sm text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto w-[min(96vw,72rem)] border-x border-foreground/20">
      <div className="grid gap-10 px-6 py-14 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className={`${linkClass} inline-flex items-center gap-2`}
          >
            <Image
              src="/logo.svg"
              alt=""
              width={28}
              height={20}
              className="h-5 w-auto"
            />
            <span className="font-bold text-foreground">
              devlinks<span className="text-primary">_</span>
            </span>
            <span className="sr-only">, ir al inicio</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty text-muted-foreground">
            Un link para todo lo que has construido. Tu identidad dev pública,
            sin fricción.
          </p>
          <ul
            className="mt-6 flex items-center gap-2"
            aria-label="Redes sociales"
          >
            {SOCIALS.map(({ label, icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (se abre en una pestaña nueva)`}
                  className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-[color,border-color,scale] duration-150 ease-out hover:border-foreground/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]"
                >
                  <BrandIcon name={icon} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {NAV.map(({ title, links }) => (
          <nav key={title} aria-labelledby={`footer-${title}`}>
            <h2
              id={`footer-${title}`}
              className="text-xs font-semibold tracking-widest text-foreground uppercase"
            >
              {title}
            </h2>
            <ul className="mt-4 space-y-3">
              {links.map(({ label, href, external }) => (
                <li key={label}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {label}
                      <span className="sr-only">
                        {" "}
                        (se abre en una pestaña nueva)
                      </span>
                    </a>
                  ) : (
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-foreground/20 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} DevLinks · Hecho por{" "}
          <span className="text-foreground">Nova 11 Labs</span>
        </p>
        <p className="inline-flex items-center gap-2">
          <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-foreground">
            beta
          </span>
          {"// "}build in public para developers
        </p>
      </div>
    </footer>
  );
}
