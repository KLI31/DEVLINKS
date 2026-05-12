import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { getIconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Tech = { slug: string; name: string };

const ROW_A: Tech[] = [
  { slug: "typescript", name: "TypeScript" },
  { slug: "react", name: "React" },
  { slug: "nextdotjs", name: "Next.js" },
  { slug: "nodedotjs", name: "Node.js" },
  { slug: "tailwindcss", name: "Tailwind" },
  { slug: "vercel", name: "Vercel" },
  { slug: "github", name: "GitHub" },
  { slug: "prisma", name: "Prisma" },
  { slug: "postgresql", name: "PostgreSQL" },
  { slug: "docker", name: "Docker" },
  { slug: "vite", name: "Vite" },
  { slug: "nestjs", name: "NestJS" },
];

const ROW_B: Tech[] = [
  { slug: "python", name: "Python" },
  { slug: "go", name: "Go" },
  { slug: "rust", name: "Rust" },
  { slug: "bun", name: "Bun" },
  { slug: "deno", name: "Deno" },
  { slug: "redis", name: "Redis" },
  { slug: "mongodb", name: "MongoDB" },
  { slug: "graphql", name: "GraphQL" },
  { slug: "supabase", name: "Supabase" },
  { slug: "figma", name: "Figma" },
  { slug: "linux", name: "Linux" },
  { slug: "javascript", name: "JavaScript" },
];

function TechPill({ tech }: { tech: Tech }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 rounded-full",
        "border border-white/10 bg-white/[0.03] px-4 py-2",
        "text-sm font-medium text-foreground/85",
        "transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
      )}
    >
      <Image
        src={getIconUrl(tech.slug)}
        alt=""
        width={18}
        height={18}
        unoptimized
        className="opacity-90"
      />
      {tech.name}
    </span>
  );
}

export function TechMarquee() {
  return (
    <section className="relative mx-auto w-[min(96vw,72rem)] py-20 sm:py-24">
      <div className=" mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Funciona con tu <span className="text-second">stack favorito.</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            Linkea repos, despliegues, perfiles y herramientas — sin importar
            con qué construyas. Si tiene URL, cabe en tu DevLink.
          </p>
        </div>
      </div>

      <div className="relative mt-12 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <Marquee pauseOnHover className="py-2">
          {ROW_A.map((tech) => (
            <TechPill key={tech.slug} tech={tech} />
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse className="mt-4 py-2">
          {ROW_B.map((tech) => (
            <TechPill key={tech.slug} tech={tech} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
