import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Únete a DevLinks gratis. Crea tu hub de links para developers con integración GitHub, analíticas y QR codes.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Crear cuenta | DevLinks",
    description:
      "Únete a DevLinks gratis. Crea tu hub de links para developers con integración GitHub, analíticas y QR codes.",
    url: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
