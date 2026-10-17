import { QRCodeSVG } from "qrcode.react";
import { Check, ChevronRight, Download, Star } from "lucide-react";

import { cn } from "@/lib/utils";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex h-fit items-center gap-1 text-sm font-medium text-primary">
      {children}
      <ChevronRight className="size-4" aria-hidden />
    </p>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="w-fit max-w-[85%] rounded-xl border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-card">
      {children}
    </p>
  );
}

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

function GitHubMockup() {
  const repos = [
    { name: "ui-kit", stars: "1.2k", lang: "TypeScript" },
    { name: "dotfiles", stars: "340", lang: "Shell" },
    { name: "react-hooks", stars: "212", lang: "TypeScript" },
  ];

  return (
    <Panel className="mx-auto mt-5 w-[88%]">
      <ul className="divide-y divide-border text-sm">
        {repos.map((repo) => (
          <li
            key={repo.name}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <span>{repo.name}</span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Star className="size-3" aria-hidden />
              {repo.stars}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Sincronizando · 48 repos</span>
          <span className="text-foreground tabular-nums">64%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div className="h-full w-[64%] rounded-full bg-foreground" />
        </div>
      </div>
    </Panel>
  );
}

function AnalyticsMockup() {
  const links = [
    { title: "Portafolio", clicks: 412, width: "w-full" },
    { title: "Curso de React", clicks: 268, width: "w-[65%]" },
    { title: "Newsletter", clicks: 97, width: "w-[24%]" },
  ];

  return (
    <Panel className="mx-auto mt-5 w-[88%] p-4">
      <p className="text-xs text-muted-foreground">Últimos 7 días</p>
      <p className="mt-0.5 font-semibold">777 clics · 3 links</p>
      <ul className="mt-4 space-y-3 text-xs">
        {links.map((link) => (
          <li key={link.title}>
            <div className="flex justify-between">
              <span>{link.title}</span>
              <span className="text-muted-foreground tabular-nums">
                {link.clicks}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-second", link.width)}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function QrMockup() {
  return (
    <Panel className="mx-auto mt-5 w-[88%] overflow-hidden">
      <div className="flex justify-center bg-white p-5">
        <QRCodeSVG value="https://devlinks.lramdev.com/u/leomarin" size={104} />
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">Perfil público</p>
        <p className="mt-0.5 text-sm font-semibold">/u/leomarin</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background">
          <Download className="size-3.5" aria-hidden />
          Descargar QR
        </span>
      </div>
    </Panel>
  );
}

const FLOW = [
  {
    prompt: "Conecta mi GitHub y destaca mis mejores repos",
    title: "Tu GitHub, siempre al día.",
    description:
      "Repos, stars y seguidores se sincronizan solos y se refrescan cada 6 horas.",
    tint: "from-primary/20 to-primary/5",
    Mockup: GitHubMockup,
  },
  {
    prompt: "¿Qué link me trajo más visitas esta semana?",
    title: "Analíticas por link.",
    description:
      "Clics, países y dispositivos para saber qué contenido sí funciona.",
    tint: "from-second/20 to-second/5",
    Mockup: AnalyticsMockup,
  },
  {
    prompt: "Necesito un QR para mi charla del viernes",
    title: "Compártelo en cualquier lado.",
    description:
      "Un enlace corto y un QR listos para tu CV, slides o networking.",
    tint: "from-muted to-muted/30",
    Mockup: QrMockup,
  },
];

const IMPORT_STEPS = ["Perfil y bio", "6 links ordenados", "GitHub conectado"];

export default function FeaturesSection() {
  return (
    <>
      <section className="reveal grid gap-6 px-6 py-20 sm:px-10 md:grid-cols-[1fr_1.4fr] md:gap-12">
        <Eyebrow>Presentando DevLinks</Eyebrow>
        <div className="space-y-6 font-[family-name:var(--font-inter)] text-lg leading-relaxed text-pretty text-muted-foreground">
          <p>
            <strong className="font-semibold text-foreground">
              Tu trabajo como developer está disperso.
            </strong>{" "}
            El GitHub por un lado, el portafolio por otro, tus charlas en un
            tweet de hace dos años y el CV en un PDF que nadie abre.
          </p>
          <p>
            <strong className="font-semibold text-foreground">
              DevLinks lo junta en un solo link.
            </strong>{" "}
            Tus repos, stats y enlaces en una página rápida, con analíticas por
            link y un QR para compartir en cualquier evento, sin configurar
            nada.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="reveal mx-auto max-w-2xl text-center">
          <Eyebrow>Todo en un solo flujo</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
            Conecta, mide, comparte. Un solo link.
          </h2>
          <p className="mt-5 font-[family-name:var(--font-inter)] text-lg text-pretty text-muted-foreground">
            La mayoría junta un Linktree, un README y una hoja de cálculo para
            mostrar lo que hace. DevLinks lo resuelve en una sola página.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FLOW.map(({ prompt, title, description, tint, Mockup }) => (
            <article key={title} className="reveal">
              <div
                aria-hidden
                className={cn(
                  "h-80 overflow-hidden rounded-2xl bg-linear-to-b p-5 pb-0 sm:h-[22rem]",
                  tint,
                )}
              >
                <Prompt>{prompt}</Prompt>
                <Mockup />
              </div>
              <p className="mt-4 font-[family-name:var(--font-inter)] text-pretty text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  {title}
                </strong>{" "}
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <h2 className="reveal text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Tu perfil, versionado como tu código.
        </h2>
        <p className="reveal mt-5 max-w-3xl font-[family-name:var(--font-inter)] text-lg leading-relaxed text-pretty text-muted-foreground">
          Importa tu perfil desde un JSON y DevLinks crea tus links, tu bio y tu
          conexión con GitHub en segundos. Guárdalo en tu repo y restáuralo
          cuando quieras.
        </p>

        <div
          aria-hidden
          className="reveal relative mt-12 grid gap-6 md:grid-cols-[1fr_1.5fr] md:items-start"
        >
          <Prompt>Importa mi perfil desde devlinks.json</Prompt>
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs">
              <span className="font-semibold">devlinks.json</span>
              <span className="text-muted-foreground">JSON válido</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-muted-foreground">
              {`{
  "username": "leomarin",
  "bio": "Frontend · Open source",
  "github": "leomarin",
  "links": [
    { "title": "Mi sitio", "url": "https://leo.dev" },
    { "title": "Curso de React", "url": "https://..." }
  ]
}`}
            </pre>
            <ul className="space-y-2 border-t border-border p-4 text-sm">
              {IMPORT_STEPS.map((step) => (
                <li key={step} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {step}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>
    </>
  );
}
