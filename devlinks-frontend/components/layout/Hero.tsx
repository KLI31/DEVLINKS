"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BadgeCheck, Globe, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getPublicProfileUrlPrefix } from "@/lib/utils";
import { getSocialIconUrl, type IconName } from "@/lib/icons";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";

const PEOPLE = [
  {
    name: "María Gómez",
    image: "https://github.com/john-doe.png",
    url: "https://github.com/john-doe",
  },
  {
    name: "Jane Doe",
    image: "https://github.com/jane-doe.png",
    url: "https://github.com/jane-doe",
  },
  {
    name: "Juan Pérez",
    image: "https://github.com/john-doe.png",
    url: "https://github.com/john-doe",
  },
  {
    name: "Andrés Ramírez",
    image: "https://avatars.githubusercontent.com/u/1561955?v=4",
    url: "https://github.com/jane-doe",
  },
  {
    name: "Luis David",
    image: "https://avatars.githubusercontent.com/u/66835521?v=4",
    url: "https://github.com/john-doe",
  },
];

const USERNAME_LOCAL_MIN_LEN = 3;

function sanitizeUsernameInput(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, "");
}

function buildPublicProfileUrl(usernameSegment: string): string {
  const segment = sanitizeUsernameInput(usernameSegment).trim().toLowerCase();
  return segment ? `${getPublicProfileUrlPrefix()}${segment}` : "";
}

function ShinyBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
      </span>
      <span className="animate-shine">Para developers, por developers</span>
    </span>
  );
}

function LinkPreviewCard() {
  const socialLinks: { icon: IconName; label: string }[] = [
    { icon: "github", label: "GitHub" },
    { icon: "twitter", label: "Twitter" },
    { icon: "youtube", label: "YouTube" },
    { icon: "linkedin", label: "LinkedIn" },
    { icon: "discord", label: "Web" },
  ];

  const metrics = [
    { label: "Repos", value: "222" },
    { label: "Followers", value: "23.1k" },
    { label: "Following", value: "104" },
    { label: "Stars", value: "3.1k" },
  ];

  const featuredRepos = [
    {
      name: "midudev/curso-react",
      description: "Curso de React desde cero a avanzado",
      stars: "2.3k",
      language: "TypeScript",
    },
    {
      name: "midudev/midfy",
      description: "Librería de componentes React",
      stars: "1.1k",
      language: "TypeScript",
    },
    {
      name: "midudev/configs",
      description: "Mis configuraciones de desarrollo",
      stars: "560",
      language: "JavaScript",
    },
  ];

  return (
    <div className="relative mx-auto w-fit lg:scale-95 lg:rotate-[1.7deg]">
      <div className="pointer-events-none absolute -left-16 top-10 z-0 h-44 w-44 rounded-full bg-primary/30 blur-[70px]" />
      <div className="pointer-events-none absolute -right-10 -top-8 z-0 h-36 w-36 rounded-full bg-second/25 blur-[60px]" />
      <div className="absolute -inset-6 z-0 bg-radial from-primary/30 via-primary/10 to-transparent opacity-80 blur-2xl" />
      <div className="pointer-events-none absolute -right-4 top-8 z-10 h-[85%] w-[24rem] rotate-[-4deg] rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.45),rgba(9,14,24,0.25))] shadow-[0_14px_40px_rgba(2,8,23,0.25)]" />
      <div className="relative z-20 w-96 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(15,23,42,0.96),rgba(9,14,24,0.95))] p-5 text-white shadow-[0_22px_60px_rgba(2,8,23,0.5)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.2),transparent_45%)]" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-14 overflow-visible">
              <div className="absolute -right-2.5 top-1 size-7 overflow-hidden rounded-full border border-white/20 bg-black/30 opacity-70 blur-[0.2px]">
                <Image
                  src="https://avatars.githubusercontent.com/u/50589490?v=4"
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <div className="relative size-14 overflow-hidden rounded-full border border-white/15 bg-muted/40">
                <Image
                  src="https://avatars.githubusercontent.com/u/1561955?v=4"
                  alt="Avatar de midudev"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  midudev
                </h3>
                <BadgeCheck className="size-4 fill-primary text-primary" />
              </div>
              <p className="text-xs text-white/70">@midudev</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Compartir perfil"
          >
            <Globe className="size-3.5" />
          </button>
        </div>

        <div className="relative mt-4 space-y-2">
          <p className="text-sm text-white">Full Stack Developer</p>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <MapPin className="size-3.5 text-primary" />
            <span>Madrid, España</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span className="underline decoration-dotted underline-offset-2">
              midu.dev
            </span>
          </div>
          <p className="text-sm text-white/90">
            Me encanta construir productos y compartir conocimiento.
          </p>
        </div>

        <div className="relative mt-4 flex items-center gap-3">
          {socialLinks.map(({ icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="group/icon inline-flex h-8 w-8 items-center justify-center text-white/80 transition-all hover:scale-110 hover:text-white"
            >
              <Image
                src={getSocialIconUrl(icon)}
                alt={label}
                width={18}
                height={18}
                unoptimized
                className="opacity-90 transition-opacity group-hover/icon:opacity-100"
              />
            </a>
          ))}
        </div>

        <div className="relative mt-4 grid grid-cols-4 overflow-hidden rounded-xl border border-white/12 bg-white/4">
          {metrics.map(({ label, value }) => (
            <div key={label} className=" px-3 py-2 last:border-r-0">
              <p className="text-[11px] text-white/65">{label}</p>
              <p className="text-base font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-4 rounded-xl border border-white/12 bg-white/3 p-3">
          <p className="mb-2 text-xs font-medium tracking-wide text-white">
            Repositorios destacados
          </p>
          <div className="space-y-2">
            {featuredRepos.map((repo) => (
              <div
                key={repo.name}
                className="rounded-lg border border-white/10 bg-black/10 px-2.5 py-2"
              >
                <p className="text-xs font-semibold text-white">{repo.name}</p>
                <p className="mt-0.5 text-[11px] text-white/70">
                  {repo.description}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" />
                    {repo.stars}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {repo.language}
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-3">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/4 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Image
              src={getSocialIconUrl("github")}
              alt="GitHub"
              width={14}
              height={14}
              unoptimized
              className="opacity-90"
            />
            Ver más en GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const router = useRouter();
  const [usernameSegment, setUsernameSegment] = useState("");
  const claimedProfileUrl = useMemo(
    () => buildPublicProfileUrl(usernameSegment),
    [usernameSegment],
  );
  const canClaim =
    sanitizeUsernameInput(usernameSegment).trim().length >=
    USERNAME_LOCAL_MIN_LEN;

  const handleClaimUsername = () => {
    if (!canClaim) return;
    const slug = sanitizeUsernameInput(usernameSegment).trim().toLowerCase();
    router.push(`/register?username=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] w-[min(96vw,72rem)] mx-auto grid-cols-1 items-center gap-12 pt-20 lg:grid-cols-2">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <p className="mb-4">
          <ShinyBadge />
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Un solo link para mostrar quién eres como{" "}
          <span className="text-second">
            developer
            <span
              className="animate-caret-blink inline-block translate-y-[0.03em] select-none"
              aria-hidden="true"
            >
              _
            </span>
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Conecta tu GitHub. Centraliza tus links. Compártelo con un QR.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
          <AvatarGroup className="shrink-0">
            {PEOPLE.map((person) => (
              <Avatar key={person.name}>
                <AvatarImage src={person.image} />
                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount>+20</AvatarGroupCount>
          </AvatarGroup>
          <p className="min-w-0 text-center text-sm text-muted-foreground sm:text-left">
            y <span className="font-bold text-secondary-light">500+</span>{" "}
            developers más
          </p>
        </div>
        <div className="mt-8 flex w-full max-w-xl flex-col items-stretch gap-2 sm:flex-row sm:items-start">
          <form
            className="flex w-full min-w-0 flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleClaimUsername();
            }}
          >
            <div
              className={cn(
                "flex min-h-11 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-background shadow-xs",
                "focus-within:border-ring/80 focus-within:ring-2 focus-within:ring-ring/55 focus-within:ring-inset focus-within:ring-offset-0",
              )}
            >
              <span
                className={cn(
                  "flex min-w-0 max-w-[52%] shrink items-center bg-linear-to-r from-muted/45 via-muted/20 to-transparent",
                  "py-1.5 pl-3  text-[11px] leading-snug break-all text-muted-foreground/90",
                  "sm:max-w-none  sm:text-sm sm:leading-normal",
                )}
                aria-hidden="true"
              >
                {getPublicProfileUrlPrefix()}
              </span>
              <Input
                type="text"
                inputMode="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Nombre de usuario para tu perfil"
                placeholder="tu-usuario"
                value={usernameSegment}
                onChange={(e) =>
                  setUsernameSegment(sanitizeUsernameInput(e.target.value))
                }
                className={cn(
                  "min-h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent pr-2 px-0 py-2 shadow-none md:text-sm ",
                  "text-muted-foreground placeholder:text-muted-foreground/65",
                  "outline-none focus-visible:ring-0",
                )}
              />
              <Button
                type="submit"
                variant="secondary"
                className="h-auto min-h-11 shrink-0 rounded-none rounded-r-[calc(var(--radius-lg)-0.0625rem)] border-0 px-4 bg-primary text-primary-foreground outline-none hover:bg-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={!canClaim}
              >
                Reclamar
              </Button>
            </div>
            {claimedProfileUrl ? (
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                <span className="break-all font-mono text-muted-foreground">
                  {claimedProfileUrl}
                </span>
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                Mínimo {USERNAME_LOCAL_MIN_LEN} caracteres · letras, números y
                guion bajo
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="hidden lg:block">
        <LinkPreviewCard />
      </div>
    </div>
  );
}
