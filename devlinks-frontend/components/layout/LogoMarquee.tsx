import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { getIconUrl } from "@/lib/icons";

const brands = [
  { name: "Google", icon: "google" },
  { name: "Microsoft", icon: "microsoft" },
  { name: "Vercel", icon: "vercel" },
  { name: "GitHub", icon: "github" },
  { name: "AWS", icon: "amazonaws" },
  { name: "Docker", icon: "docker" },
];

function BrandLogo({ name, icon }: { name: string; icon: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center grayscale opacity-40 transition-all duration-300 hover:grayscale-0 hover:opacity-100",
        "mx-8",
      )}
      title={name}
    >
      <Image
        src={getIconUrl(icon)}
        alt={name}
        width={24}
        height={24}
        className="h-6 w-auto"
        unoptimized
      />
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="py-8">
      <Marquee pauseOnHover className="py-4">
        {brands.map((brand) => (
          <BrandLogo key={brand.name} name={brand.name} icon={brand.icon} />
        ))}
      </Marquee>
    </section>
  );
}
