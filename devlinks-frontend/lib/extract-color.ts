/**
 * Extracción de color dominante desde una imagen, 100% en el navegador con
 * Canvas (sin dependencias). Si la imagen no permite CORS, el canvas queda
 * "tainted" y `getImageData` lanza: en ese caso devolvemos `null` y el llamador
 * simplemente no aplica ningún color.
 */

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Oscurece un color hacia un azul-noche para usarlo como fondo, manteniendo el
 * tinte del acento pero con suficiente contraste para texto claro.
 */
export function deriveBg(hex: string): string {
  const clean = hex.replace(/^#/, "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Mezcla 18% del color con 82% de #0b1020 (azul muy oscuro).
  const mix = (c: number, target: number) => c * 0.18 + target * 0.82;
  return rgbToHex(mix(r, 11), mix(g, 16), mix(b, 32));
}

/**
 * Devuelve el color dominante (promedio ponderado, ignorando píxeles casi
 * transparentes y los grises muy apagados) de una imagen, o `null` si no se
 * pudo leer.
 */
export function extractDominantColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let weight = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 125) continue;
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          // Saturación aproximada: prioriza píxeles con color sobre grises.
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const w = 0.25 + sat;
          r += pr * w;
          g += pg * w;
          b += pb * w;
          weight += w;
        }

        if (weight === 0) {
          resolve(null);
          return;
        }
        resolve(rgbToHex(r / weight, g / weight, b / weight));
      } catch {
        // Canvas tainted por CORS u otro error de lectura.
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
}
