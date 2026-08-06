/**
 * Picks a readable text color (white or dark) for an arbitrary background
 * hex color, using perceived luminance. Used where a color is chosen freely
 * (e.g. an admin color picker) and text is overlaid on it, so a light pick
 * doesn't end up with unreadable white-on-white/yellow/etc text.
 */
export function readableTextColor(hex, { light = "#ffffff", dark = "#0f172a" } = {}) {
    if (typeof hex !== "string") return light;
    const clean = hex.replace("#", "").trim();
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return light;

    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const perceivedLuminance = 0.299 * r + 0.587 * g + 0.114 * b;

    return perceivedLuminance > 150 ? dark : light;
}
