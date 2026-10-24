"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { HeroBackground } from "@/components/layout/HeroBackground";
import { HoloSticker } from "@/components/layout/HoloSticker";
import type { HoloIcon } from "@/lib/holo-icons";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import {
  DEMO_GITHUB_STATS,
  DEMO_PROFILE,
  DEMO_SIDE_PROFILES,
  DEMO_PROJECTS,
} from "@/lib/landing-demo";
import { cn, getPublicProfileUrlPrefix } from "@/lib/utils";

const USERNAME_LOCAL_MIN_LEN = 3;

const PEOPLE = [
  { initials: "AR", className: "bg-card text-card-foreground" },
  { initials: "LM", className: "bg-primary text-primary-foreground" },
  { initials: "SC", className: "bg-second text-white" },
  { initials: "KP", className: "bg-foreground text-background" },
];

function sanitizeUsernameInput(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, "");
}

export function ClaimForm() {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [showError, setShowError] = useState(false);
  const slug = username.trim().toLowerCase();
  const canClaim = slug.length >= USERNAME_LOCAL_MIN_LEN;
  const prefix = getPublicProfileUrlPrefix().replace(/^https?:\/\//, "");

  return (
    <form
      noValidate
      className="flex w-full max-w-xl flex-col items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canClaim) {
          setShowError(true);
          inputRef.current?.focus();
          return;
        }
        router.push(`/register?username=${encodeURIComponent(slug)}`);
      }}
    >
      <div
        className={cn(
          "flex w-full items-center rounded-full border bg-card/80 p-1.5 pl-5 shadow-card backdrop-blur-sm",
          "transition-[border-color,box-shadow] duration-150 focus-within:ring-3",
          showError
            ? "border-destructive focus-within:ring-destructive/30"
            : "border-border focus-within:border-ring focus-within:ring-ring/40",
        )}
      >
        <label
          htmlFor={`${id}-input`}
          className="shrink-0 text-sm text-muted-foreground"
        >
          <span className="hidden sm:inline">{prefix}</span>
          <span className="sm:hidden">/u/</span>
          <span className="sr-only">Elige tu nombre de usuario</span>
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="tu-usuario"
          aria-invalid={showError || undefined}
          aria-describedby={`${id}-hint`}
          value={username}
          onChange={(e) => {
            setUsername(sanitizeUsernameInput(e.target.value));
            setShowError(false);
          }}
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
        />
        <button
          type="submit"
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground",
            "transition-[scale,background-color] duration-150 ease-out hover:bg-primary-dark active:scale-[0.96]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          Reclamar
        </button>
      </div>
      <p
        id={`${id}-hint`}
        className={cn(
          "text-xs",
          showError ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {showError ? (
          <>Tu usuario necesita al menos {USERNAME_LOCAL_MIN_LEN} caracteres.</>
        ) : canClaim ? (
          <>
            Tu perfil:{" "}
            <span className="text-foreground">
              {prefix}
              {slug}
            </span>
            {" · "}
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">
              Enter
            </kbd>{" "}
            para reclamar
          </>
        ) : (
          <>
            Mínimo {USERNAME_LOCAL_MIN_LEN} caracteres · letras, números y guion
            bajo
          </>
        )}
      </p>
    </form>
  );
}

function SocialProof() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2" aria-hidden>
        {PEOPLE.map(({ initials, className }) => (
          <span
            key={initials}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background",
              className,
            )}
          >
            {initials}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">500+</span> developers
        ya tienen el suyo
      </p>
    </div>
  );
}

function SideCard({ index }: { index: 0 | 1 }) {
  const { profile, projects, stats } = DEMO_SIDE_PROFILES[index];
  return (
    <div
      inert
      className="h-[38rem] w-[20rem] overflow-hidden rounded-[30px] ring-1 ring-border shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)]"
    >
      <PublicProfileCard
        profile={profile}
        projects={projects}
        githubStats={stats}
        hideShare
        demo
      />
    </div>
  );
}

function DemoCards() {
  return (
    <div
      aria-hidden
      className="relative mt-16 flex w-full items-start justify-center gap-4 overflow-hidden px-4 pt-6 sm:mt-20 [mask-image:linear-gradient(to_bottom,black_55%,rgb(0_0_0/0.6)_75%,rgb(0_0_0/0.2)_90%,transparent)]"
    >
      <div
        style={{ "--r": "-4deg", "--d": "500ms" } as React.CSSProperties}
        className="animate-hero-card hidden translate-y-10 transition-transform duration-300 ease-out motion-safe:hover:translate-y-4 md:block"
      >
        <SideCard index={0} />
      </div>
      <div
        inert
        style={{ "--d": "400ms" } as React.CSSProperties}
        className="animate-hero-card relative z-10 h-[44rem] w-[22rem] shrink-0 overflow-hidden rounded-[30px] ring-1 ring-border"
      >
        <PublicProfileCard
          profile={DEMO_PROFILE}
          projects={DEMO_PROJECTS}
          githubStats={DEMO_GITHUB_STATS}
          hideShare
          demo
        />
      </div>
      <div
        style={{ "--r": "4deg", "--d": "600ms" } as React.CSSProperties}
        className="animate-hero-card hidden translate-y-10 transition-transform duration-300 ease-out motion-safe:hover:translate-y-4 md:block"
      >
        <SideCard index={1} />
      </div>
    </div>
  );
}

const STICKERS: {
  icon: HoloIcon;
  className: string;
  r: string;
  d: string;
}[] = [
  {
    icon: "typescript",
    className: "left-[6%] top-40",
    r: "-12deg",
    d: "700ms",
  },
  { icon: "python", className: "left-[13%] top-80", r: "8deg", d: "850ms" },
  {
    icon: "docker",
    className: "left-[5%] top-[30rem]",
    r: "-6deg",
    d: "1000ms",
  },
  { icon: "react", className: "right-[6%] top-36", r: "10deg", d: "750ms" },
  { icon: "rust", className: "right-[13%] top-72", r: "-9deg", d: "900ms" },
  { icon: "go", className: "right-[5%] top-[29rem]", r: "6deg", d: "1050ms" },
];

function HoloStickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 hidden xl:block"
    >
      {STICKERS.map(({ icon, className, r, d }) => (
        <HoloSticker
          key={icon}
          icon={icon}
          className={className}
          style={{ "--r": r, "--d": d } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex flex-col items-center pt-36 sm:pt-40">
      <HeroBackground />
      <HoloStickers />
      <div className="relative z-10 mx-auto flex w-[min(92vw,56rem)] flex-col items-center text-center">
        <p
          style={{ "--i": 0 } as React.CSSProperties}
          className="animate-hero-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
        >
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Gratis · Integración nativa con GitHub
        </p>

        <h1
          style={{ "--i": 1 } as React.CSSProperties}
          className="animate-hero-rise mt-6 text-4xl leading-[1.05] font-extrabold tracking-tighter text-balance text-foreground sm:text-6xl lg:text-7xl"
        >
          Tu perfil de developer, listo en{" "}
          <span className="shiny-border inline-block -rotate-2 rounded-2xl bg-primary px-3 text-primary-foreground shadow-[0_12px_40px_-12px_var(--color-primary)]">
            <span aria-hidden className="sheen" />
            <span className="sr-only">60</span>
            <span aria-hidden className="animate-count tabular-nums" /> segundos
          </span>
        </h1>

        <p
          style={{ "--i": 2 } as React.CSSProperties}
          className="animate-hero-rise mt-6 max-w-xl font-[family-name:var(--font-inter)] text-lg text-pretty text-muted-foreground"
        >
          Conecta tu GitHub, ordena tus links y compártelos con un solo enlace o
          un QR.
        </p>

        <div
          style={{ "--i": 3 } as React.CSSProperties}
          className="animate-hero-rise mt-10 flex w-full justify-center"
        >
          <ClaimForm />
        </div>

        <div
          style={{ "--i": 4 } as React.CSSProperties}
          className="animate-hero-rise mt-8"
        >
          <SocialProof />
        </div>
      </div>

      <DemoCards />
    </section>
  );
}
