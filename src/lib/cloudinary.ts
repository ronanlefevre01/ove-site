// src/lib/cloudinary.ts
export function cld(url: string, params: string) {
  // Insère "params" après "/upload/" : ex: f_auto,q_auto,w_800,c_fill,g_auto
  if (!url) return url;
  try {
    const marker = "/image/upload/";
    const i = url.indexOf(marker);
    if (i === -1) return url; // URL non standard, on renvoie tel quel
    const head = url.slice(0, i + marker.length);
    const tail = url.slice(i + marker.length);
    return `${head}${params}/${tail}`.replace(/([^:])\/{2,}/g, "$1/"); // nettoyage doubles slashes
  } catch {
    return url;
  }
}
