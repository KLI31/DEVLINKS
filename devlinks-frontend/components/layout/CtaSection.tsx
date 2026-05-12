"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, type Variants } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { getIconUrl } from "@/lib/icons";
import { cn, getPublicProfileUrlPrefix } from "@/lib/utils";

const PEOPLE = [
  {
    name: "María Gómez",
    image: "https://github.com/john-doe.png",
  },
  {
    name: "Jane Doe",
    image: "https://github.com/jane-doe.png",
  },
  {
    name: "Andrés Ramírez",
    image: "https://avatars.githubusercontent.com/u/1561955?v=4",
  },
  {
    name: "Luis David",
    image: "https://avatars.githubusercontent.com/u/66835521?v=4",
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CtaSection() {
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
    <section
      aria-labelledby="cta-heading"
      className="relative w-[min(96vw,72rem)] mx-auto px-4 py-28 sm:py-36"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={cardVariants}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10",
          "bg-[linear-gradient(155deg,rgba(15,23,42,0.96),rgba(9,14,24,0.95))]",
          "shadow-[0_8px_24px_rgba(2,8,23,0.25)]",
          "px-6 py-16 sm:px-12 sm:py-24",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:22px_22px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-[24rem] w-[24rem] rounded-full bg-second/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 h-[18rem] w-[18rem] rounded-full bg-primary/20 blur-[100px]"
        />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.h2
            id="cta-heading"
            variants={itemVariants}
            className="mt-8 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Tu próximo{" "}
            <span className="text-second">
              git push
              <span
                className="animate-caret-blink inline-block translate-y-[0.03em] select-none"
                aria-hidden="true"
              >
                _
              </span>
            </span>{" "}
            empieza con un solo link
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
          >
            Conecta tu GitHub, centraliza tus links y comparte quién eres como
            developer en menos de 60 segundos.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12 w-full max-w-xl">
            <form
              className="flex w-full min-w-0 flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleClaimUsername();
              }}
            >
              <div
                className={cn(
                  "flex min-h-14 w-full min-w-0 overflow-hidden rounded-xl border border-white/12 bg-white/5",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                  "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-inset focus-within:ring-offset-0",
                )}
              >
                <span
                  className={cn(
                    "flex min-w-0 max-w-[52%] shrink items-center bg-linear-to-r from-white/8 via-white/4 to-transparent",
                    "py-1.5 pl-3 text-[11px] leading-snug break-all text-white/65",
                    "sm:max-w-none sm:text-sm sm:leading-normal",
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
                    "h-14 min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 px-0 py-4 shadow-none md:text-sm",
                    "text-white placeholder:text-white/45",
                    "outline-none focus-visible:ring-0",
                  )}
                />
                <Button
                  type="submit"
                  className="h-14 self-stretch shrink-0 rounded-none rounded-r-[calc(var(--radius-xl)-0.0625rem)] border-0 px-6 bg-primary text-primary-foreground outline-none hover:bg-primary/85 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={!canClaim}
                >
                  Reclamar mi username
                </Button>
              </div>
              {claimedProfileUrl ? (
                <p className="text-center text-xs text-white/65">
                  <span className="break-all font-mono">
                    {claimedProfileUrl}
                  </span>
                </p>
              ) : (
                <p className="text-center text-xs text-white/55">
                  Mínimo {USERNAME_LOCAL_MIN_LEN} caracteres · letras, números y
                  guion bajo
                </p>
              )}
            </form>

            <div
              className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/35"
              aria-hidden
            >
              <span className="h-px flex-1 bg-white/10" />
              <span>o</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                " w-full rounded-xl border-white/15 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 hover:text-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
              )}
            >
              <Image
                src={getIconUrl("github")}
                alt=""
                width={18}
                height={18}
                unoptimized
                className="mr-2"
              />
              Iniciar con GitHub
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
          >
            <AvatarGroup className="shrink-0">
              {PEOPLE.map((person) => (
                <Avatar
                  key={person.name}
                  className="ring-[#0b1322] dark:ring-[#0b1322]"
                >
                  <AvatarImage src={person.image} />
                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="bg-white text-white/85 ring-[#0b1322]">
                +20
              </AvatarGroupCount>
            </AvatarGroup>
            <p className="text-sm text-white/80 sm:text-left">
              Ya somos{" "}
              <span className="font-semibold text-white">+500 developers</span>
              <span className="mx-1.5 text-white/35">·</span>
              <span className="text-white/85">
                no te quedes sin{" "}
                <span className="font-semibold text-second">el tuyo</span>
              </span>
            </p>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-10 text-xs text-white/50"
          >
            Gratis para siempre · Sin tarjeta · Cancela cuando quieras
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
