import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de DevLinks. Inicia sesión con GitHub o correo electrónico.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Iniciar sesión | DevLinks",
    description:
      "Accede a tu cuenta de DevLinks. Inicia sesión con GitHub o correo electrónico.",
    url: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
