"use client";

import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { iconUrl } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicProfile } from "@/types";

interface ShareProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PublicProfile;
  publicUrl: string;
  cardBg: string;
  textPrimary: string;
}

const NETWORKS: {
  name: string;
  color: string;
  slug?: string;
  path?: string;
  getUrl: (u: string) => string;
}[] = [
  {
    name: "X",
    slug: "x",
    color: "#14171a",
    getUrl: (u: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`,
  },
  {
    name: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    color: "#0a66c2",
    getUrl: (u: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: "WhatsApp",
    slug: "whatsapp",
    color: "#128c7e",
    getUrl: (u: string) => `https://wa.me/?text=${encodeURIComponent(u)}`,
  },
];

export function ShareProfileDialog({
  open,
  onOpenChange,
  profile,
  publicUrl,
  cardBg,
  textPrimary,
}: ShareProfileDialogProps) {
  const { notifySuccess, notifyError } = useNotifications();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      notifySuccess("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notifyError("Error al copiar el link");
    }
  };

  const accent = profile.accentColor;
  const displayUrl = publicUrl.replace(/^https?:\/\//, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-sm">
        <div className="flex flex-col gap-1 pr-8">
          <DialogTitle className="font-mono text-base font-semibold">
            Compartir perfil
          </DialogTitle>
          <DialogDescription>
            Cualquiera con el link puede ver tu perfil.
          </DialogDescription>
        </div>

        <div
          className="flex flex-col items-center gap-5 rounded-2xl p-6"
          style={{ background: cardBg, border: `1px solid ${accent}30` }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="size-16 overflow-hidden rounded-full"
              style={{
                background: profile.avatarUrl ? "transparent" : `${accent}25`,
                boxShadow: `0 0 0 2px ${profile.bgColor}, 0 0 0 4px ${accent}80`,
              }}
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center text-base font-bold"
                  style={{ color: textPrimary }}
                >
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-base font-bold"
                style={{ color: textPrimary }}
              >
                {profile.displayName}
              </span>
              <span className="text-xs" style={{ color: `${accent}e6` }}>
                @{profile.username}
              </span>
            </div>
          </div>

          <div className="relative rounded-xl bg-white p-3">
            <QRCodeSVG
              value={publicUrl}
              size={128}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
              aria-label={`Código QR de ${displayUrl}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white p-1.5">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="block size-5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="truncate rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-center font-mono text-xs text-muted-foreground"
            title={publicUrl}
          >
            {displayUrl}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Link copiado" : "Copiar link"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map((n) => (
            <a
              key={n.name}
              href={n.getUrl(publicUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-medium text-white ring-1 ring-inset ring-white/10 transition-[scale,filter] duration-150 ease-out hover:brightness-110 active:scale-[0.96]"
              style={{ background: n.color }}
            >
              {n.path ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                  className="size-3.5"
                >
                  <path d={n.path} />
                </svg>
              ) : (
                <Image
                  src={iconUrl(n.slug!, "ffffff")}
                  alt=""
                  width={14}
                  height={14}
                  unoptimized
                  className="size-3.5"
                />
              )}
              {n.name}
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
