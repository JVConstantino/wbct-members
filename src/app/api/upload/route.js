import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
    "image/gif",
]);

const ALLOWED_DOC_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "heic", "heif", "webp", "gif"]);
const ALLOWED_DOC_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_APPLICATION_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PUBLIC_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB (login page picture, keep tight)

function isAllowedImage(file, ext) {
    return ALLOWED_IMAGE_MIME_TYPES.has(file.type) || ALLOWED_IMAGE_EXTENSIONS.has(ext);
}

function isAllowedDoc(file, ext) {
    return ALLOWED_DOC_MIME_TYPES.has(file.type) || ALLOWED_DOC_EXTENSIONS.has(ext);
}

function sanitizeName(name) {
    return String(name || "file")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")
        .slice(0, 80) || "file";
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const isPublicUpload = searchParams.get("public") === "1";
        const isApplicationUpload = searchParams.get("context") === "application";

        if (!isPublicUpload && !isApplicationUpload) {
            const session = await auth();
            if (!session?.user) {
                return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
            }
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const kind = (formData.get("kind") || "").toString().toLowerCase(); // optional hint: "doc" or "image" inside application context

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const rawExt = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
        const ext = rawExt;

        let allowed = false;
        let maxSize = MAX_IMAGE_SIZE_BYTES;

        if (isApplicationUpload) {
            if (kind === "image" || kind === "picture") {
                allowed = isAllowedImage(file, ext);
                maxSize = MAX_APPLICATION_SIZE_BYTES;
            } else {
                allowed = isAllowedDoc(file, ext);
                maxSize = MAX_APPLICATION_SIZE_BYTES;
            }
        } else if (isPublicUpload) {
            allowed = isAllowedImage(file, ext);
            maxSize = MAX_PUBLIC_IMAGE_SIZE_BYTES;
        } else {
            allowed = isAllowedImage(file, ext) || isAllowedDoc(file, ext);
            maxSize = MAX_IMAGE_SIZE_BYTES;
        }

        if (!allowed) {
            const allowedList = isApplicationUpload
                ? (kind === "image" || kind === "picture"
                    ? "JPG, JPEG, PNG, HEIC, HEIF, WebP, GIF"
                    : "PDF, DOC, DOCX")
                : "HEIC, HEIF, JPG, JPEG, PNG, WebP, GIF, PDF, DOC, DOCX";
            return NextResponse.json(
                { success: false, error: `File type not allowed. Accepted: ${allowedList}.` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (buffer.byteLength > maxSize) {
            const sizeMb = Math.round(maxSize / (1024 * 1024));
            return NextResponse.json(
                { success: false, error: `File too large. Maximum size: ${sizeMb} MB.` },
                { status: 400 }
            );
        }

        const safeExt = ext || (isApplicationUpload && kind !== "image" && kind !== "picture" ? "pdf" : "bin");
        const baseName = sanitizeName(file.name.replace(/\.[^.]+$/, ""));
        let urlPath;

        if (isApplicationUpload) {
            const requestedId = (formData.get("applicationId") || "").toString().trim();
            const folderUuid = /^[a-f0-9-]{8,64}$/i.test(requestedId) ? requestedId : randomUUID();
            const uploadDir = join(process.cwd(), "public", "uploads", "applications", folderUuid);
            await mkdir(uploadDir, { recursive: true });
            const filename = `${baseName}-${randomUUID().slice(0, 8)}.${safeExt}`;
            const path = join(uploadDir, filename);
            await writeFile(path, buffer);
            urlPath = `/uploads/applications/${folderUuid}/${filename}`;
        } else {
            const uploadDir = join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            const filename = `${randomUUID()}.${safeExt}`;
            const path = join(uploadDir, filename);
            await writeFile(path, buffer);
            urlPath = `/uploads/${filename}`;
        }

        return NextResponse.json({
            success: true,
            url: urlPath,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
