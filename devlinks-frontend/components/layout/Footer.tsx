import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIconUrl } from "@/lib/icons";

const socials: {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    label: "GitHub",
    href: "https://github.com",
    Icon: ({ className }) => (
      <Image
        src={getIconUrl("github")}
        alt="GitHub"
        width={24}
        height={24}
        className={className}
        unoptimized
      />
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    Icon: ({ className }) => (
      <Image
        src={getIconUrl("x")}
        alt="Twitter"
        width={24}
        unoptimized
        height={24}
        className={className}
      />
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    Icon: ({ className }) => (
      <Image
        src={getIconUrl("discord")}
        alt="Discord"
        width={24}
        unoptimized
        height={24}
        className={className}
      />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    Icon: ({ className }) => (
      <Image
        src={getIconUrl("linkedin")}
        alt="LinkedIn"
        width={24}
        unoptimized
        height={24}
        className={className}
      />
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden ">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-size-[24px_24px]"
      />
      <div aria-hidden style={{ background: "rgba(20,184,166,0.08)" }} />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="md:max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.svg"
                alt="DevLinks"
                width={28}
                height={20}
                className="h-5 w-auto"
              />
              <span className="text-base font-bold tracking-tight text-slate-900">
                Dev<span className="text-teal-600">Link</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Un link para todo lo que has construido. Tu identidad dev pública,
              sin fricción.
            </p>
          </div>
          <div className="flex flex-col gap-6 md:items-end animate-footer-fade-in">
            <div className="flex flex-col gap-1 text-[12px] text-slate-500 md:items-end md:text-right">
              <p className="font-mono">
                <span className="text-slate-400">&copy;</span>{" "}
                {new Date().getFullYear()} DevLinks &middot; Built with{" "}
                <Heart
                  className="inline size-3 -translate-y-px fill-rose-500 text-rose-500"
                  aria-label="love"
                />{" "}
                by Nova11Labs
              </p>
              <p className={cn("text-[11px] text-slate-400", "font-mono")}>
                {"// "}Build in public para developers.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:text-slate-900 hover:-translate-y-0.5 active:scale-95"
                >
                  <Icon className="size-4" />
                </a>
              ))}

              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-teal-500" />
                beta
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
