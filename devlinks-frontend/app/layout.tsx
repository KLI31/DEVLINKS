import type { Metadata, Viewport } from "next";
import {
  DM_Sans,
  Fira_Code,
  Fraunces,
  Inter,
  JetBrains_Mono,
  Outfit,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "./providers/auth-provider";
import { NotificationProvider } from "./providers/notification-provider";
import "@uiw/react-textarea-code-editor/dist.css";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devlinks.nova11labs.dev"),
  title: {
    default: "DevLinks — Hub de links para developers",
    template: "%s | DevLinks",
  },
  description:
    "Centraliza todos tus links de developer en un solo lugar. Integración nativa con GitHub, analíticas por link, QR codes y themes personalizados. Gratis para siempre.",
  keywords: [
    "linktree",
    "developer",
    "links",
    "github",
    "portfolio",
    "bio",
    "qr code",
    "analíticas",
  ],
  authors: [{ name: "Nova 11 Labs" }],
  creator: "Nova 11 Labs",
  publisher: "Nova 11 Labs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://devlinks.nova11labs.dev",
    siteName: "DevLinks",
    title: "DevLinks — Hub de links para developers",
    description:
      "Centraliza todos tus links de developer en un solo lugar. Integración nativa con GitHub, analíticas por link, QR codes y themes personalizados. Gratis para siempre.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devlinks",
    creator: "@nova11labs",
    title: "DevLinks — Hub de links para developers",
    description:
      "Centraliza todos tus links de developer en un solo lugar. Integración nativa con GitHub, analíticas por link, QR codes y themes personalizados. Gratis para siempre.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${jetbrainsMono.variable} ${firaCode.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable} ${outfit.variable} ${dmSans.variable} ${playfairDisplay.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-surface text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-1 flex-col">{children}</div>
          </AuthProvider>
          <NotificationProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
