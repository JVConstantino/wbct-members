export const EVENT_TZ = "America/Sao_Paulo";

export function formatEventDate(date, opts = {}) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { timeZone: EVENT_TZ, ...opts });
}

export function formatEventTime(date, opts = {}) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", { timeZone: EVENT_TZ, ...opts });
}

export function formatEventDateTime(date, opts = {}) {
    if (!date) return "";
    return new Date(date).toLocaleString("pt-BR", { timeZone: EVENT_TZ, ...opts });
}

function spPartsFor(utcDate, withSeconds = false) {
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: EVENT_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds ? { second: "2-digit" } : {}),
        hour12: false,
    });
    return fmt.formatToParts(utcDate);
}

function readPart(parts, type) {
    const found = parts.find(p => p.type === type);
    return found ? found.value : "";
}

export function utcToSaoPauloInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const parts = spPartsFor(d);
    let h = readPart(parts, "hour");
    if (h === "24") h = "00";
    return `${readPart(parts, "year")}-${readPart(parts, "month")}-${readPart(parts, "day")}T${h}:${readPart(parts, "minute")}`;
}

export function saoPauloInputToUtcIso(value) {
    if (!value) return null;
    const [date, time] = value.split("T");
    if (!date) return null;
    const [y, mo, d] = date.split("-").map(Number);
    const [hRaw, miRaw] = (time || "00:00").split(":");
    const h = Number(hRaw);
    const mi = Number(miRaw);
    if ([y, mo, d, h, mi].some(v => Number.isNaN(v))) return null;

    const utcGuess = Date.UTC(y, mo - 1, d, h, mi);
    const parts = spPartsFor(new Date(utcGuess), true);
    let spY = Number(readPart(parts, "year"));
    let spMo = Number(readPart(parts, "month"));
    let spD = Number(readPart(parts, "day"));
    let spH = Number(readPart(parts, "hour"));
    let spMi = Number(readPart(parts, "minute"));
    let spS = Number(readPart(parts, "second"));
    if (spH === 24) spH = 0;

    const spAsUtc = Date.UTC(spY, spMo - 1, spD, spH, spMi, spS);
    const offset = utcGuess - spAsUtc;
    return new Date(utcGuess + offset).toISOString();
}

export function getSaoPauloDateKey(date) {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TZ }).format(new Date(date));
}
