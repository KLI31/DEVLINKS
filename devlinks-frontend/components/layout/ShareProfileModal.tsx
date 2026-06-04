"use client";

import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, Link } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

interface ShareProfileModalProps {
  className?: string;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

const socialPlatforms = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25D366",
    icon: WhatsAppIcon,
    getUrl: (url: string) => `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    color: "#000000",
    icon: XIcon,
    getUrl: (url: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    icon: FacebookIcon,
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    icon: LinkedInIcon,
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#26A5E4",
    icon: TelegramIcon,
    getUrl: (url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
];

export function ShareProfileModal({ className }: ShareProfileModalProps) {
  const { user } = useAuthStore();
  const { notifySuccess, notifyError } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = user?.username ? `${origin}/u/${user.username}` : "";

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      notifySuccess("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notifyError("Error al copiar el link");
    }
  };

  const handleNativeShare = async () => {
    if (!publicUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${user?.displayName || user?.username}`,
          text: "Visita mi perfil en DevLinks",
          url: publicUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          notifyError("Error al compartir");
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleSocialShare = (platform: (typeof socialPlatforms)[0]) => {
    if (platform.id === "more") {
      handleNativeShare();
      return;
    }
    const url = platform.getUrl?.(publicUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 min-h-11 gap-2 rounded-full px-3 text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground sm:min-h-10 cursor-pointer",
              className,
            )}
            aria-label="Compartir perfil"
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
        }
      />

      <DialogContent className="max-w-sm container  gap-5 p-6 overflow-hidden">
        <DialogTitle className="sr-only">Compartir perfil</DialogTitle>

        <div className="flex flex-col items-center gap-3">
          <div className="relative rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={publicUrl}
              size={152}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white p-2 ring-2 ring-border/40 shadow-sm">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="block size-[22px] object-contain"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Escanea el código QR
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Abre la cámara de tu teléfono
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[11px] font-medium text-muted-foreground">
            o comparte en
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="flex justify-center gap-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleSocialShare(platform)}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div
                  className="flex size-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-active:scale-95"
                  style={{
                    background: `${platform.color}18`,
                    color: platform.color,
                  }}
                >
                  <Icon />
                </div>
                <span className="text-[10px] leading-none text-muted-foreground">
                  {platform.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background">
            <Link className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Enlace público
            </p>
            <p className="truncate text-xs text-foreground">{publicUrl}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 cursor-pointer"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Copiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
