import Image from "next/image";
import { cn } from "@/lib/utils";
import { getIconUrl } from "@/lib/icons";

const brands = [
  { id: 1, name: "Google", icon: "google" },
  { id: 2, name: "github Copilot", icon: "githubcopilot" },
  { id: 3, name: "Vercel", icon: "vercel" },
  { id: 4, name: "GitHub", icon: "github" },
  { id: 5, name: "Anthropic", icon: "anthropic" },
  { id: 6, name: "Docker", icon: "docker" },
];

function BrandLogo({ name, icon }: { name: string; icon: string }) {
  return (
    <div title={name} className="mx-6">
      <Image
        src={getIconUrl(icon)}
        alt={name}
        width={28}
        height={28}
        className="h-7 w-auto"
        unoptimized
      />
    </div>
  );
}

export function Brands() {
  return (
    <section className="py-16">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Con la confianza de developers de equipos en todo el mundo
        </p>
      </div>
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-center  gap-y-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100 cursor-pointer"
            >
              <BrandLogo name={brand.name} icon={brand.icon} />
              <span className="text-sm text-muted-foreground">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
