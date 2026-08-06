import { FileDown, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const DOC_LABELS = {
    cv: "CV (publications)",
    proofOfActivity: "Proof of Activity",
    motivationLetter: "Motivation Letter",
    picture: "Picture",
};

export function fileNameFromPath(p) {
    if (!p || typeof p !== "string") return "";
    const parts = p.split("/");
    return parts[parts.length - 1] || p;
}

/**
 * Renders a submitted application's documents (CV, proof of activity,
 * motivation letter, picture, additional files) with View + Download links.
 * Pass `renderExtra(entry)` to append extra actions per row (e.g. a
 * "Replace" control) without this component needing to know about upload.
 */
export function DocumentsList({ docs, applicationType, renderExtra }) {
    const entries = [];
    if (docs && typeof docs === "object") {
        if (docs.cv) entries.push({ key: "cv", url: docs.cv });
        if (applicationType === "MEMBER" && docs.proofOfActivity) {
            entries.push({ key: "proofOfActivity", url: docs.proofOfActivity });
        }
        if (docs.motivationLetter) entries.push({ key: "motivationLetter", url: docs.motivationLetter });
        if (docs.picture) entries.push({ key: "picture", url: docs.picture });
        if (Array.isArray(docs.additionalFiles)) {
            docs.additionalFiles.forEach((url, idx) => entries.push({ key: `additional-${idx}`, url, customLabel: `Additional File ${idx + 1}` }));
        }
    }

    if (entries.length === 0) {
        return (
            <EmptyState
                icon={FileDown}
                title="No documents submitted"
                description="No application documents were submitted."
            />
        );
    }

    return (
        <ul className="space-y-1.5">
            {entries.map((e) => {
                const label = e.customLabel || DOC_LABELS[e.key] || e.key;
                return (
                    <li key={e.key} className="flex items-center gap-2 text-xs">
                        <FileDown size={12} className="text-brand-primary shrink-0" />
                        <span className="text-text-secondary flex-1 min-w-0 truncate">{label}</span>
                        <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-primary hover:underline text-[11px] font-semibold shrink-0"
                        >
                            View
                            <ExternalLink size={10} />
                        </a>
                        <a
                            href={e.url}
                            download={fileNameFromPath(e.url)}
                            className="inline-flex items-center gap-1 text-text-muted hover:text-brand-primary text-[11px] font-semibold shrink-0"
                        >
                            Download
                        </a>
                        {renderExtra && renderExtra(e)}
                    </li>
                );
            })}
        </ul>
    );
}

export default DocumentsList;
