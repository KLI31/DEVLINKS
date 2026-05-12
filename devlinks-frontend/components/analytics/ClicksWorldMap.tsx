"use client";

import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import type { CountryStat } from "@/types/analytics";

interface ClicksWorldMapProps {
  countries: CountryStat[];
  accentColor: string;
}

function markerSize(count: number) {
  const min = 24;
  const max = 64;
  const logMin = Math.log(1);
  const logMax = Math.log(1000);
  const logCount = Math.log(Math.max(1, count));
  const normalized = (logCount - logMin) / (logMax - logMin);
  return Math.round(min + normalized * (max - min));
}

export function ClicksWorldMap({
  countries,
  accentColor,
}: ClicksWorldMapProps) {
  if (countries.length === 0) {
    return (
      <div className="relative h-[380px] overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Sin datos geográficos disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[380px] overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
      <Map center={[0, 20]} zoom={1.5}>
        {countries.map((country) => {
          const size = markerSize(country.count);
          return (
            <MapMarker
              key={country.countryCode}
              longitude={country.lng}
              latitude={country.lat}
            >
              <MarkerContent>
                <div
                  className="flex items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                  style={{
                    width: size,
                    height: size,
                    background: accentColor,
                    opacity: 0.85,
                  }}
                >
                  {country.count}
                </div>
              </MarkerContent>
              <MarkerTooltip>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{country.country}</span>
                  <span className="font-mono text-xs opacity-80">
                    {country.count} clics
                  </span>
                </div>
              </MarkerTooltip>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}
