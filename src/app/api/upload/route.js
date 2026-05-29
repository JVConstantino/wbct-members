import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
    "image/gif",
    "application/pdf",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const isPublicUpload = searchParams.get("public") === "1";

        if (!isPublicUpload) {
            const session = await auth();
            if (!session?.user) {
                return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
            }
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ success: false, error: "Nenhum arquivo enviado" }, { status: 400 });
        }

        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
        const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "heic", "heif", "webp", "gif"]);
        const allowedMime = ALLOWED_MIME_TYPES.has(file.type);
        const allowedExt = allowedImageExtensions.has(ext) || ext === "pdf";

        if (!allowedMime && !allowedExt) {
            return NextResponse.json(
                { success: false, error: "Tipo de arquivo não permitido. Use HEIC, HEIF, JPG, JPEG, PNG, WebP, GIF ou PDF." },
                { status: 400 }
            );
        }

        if (isPublicUpload && ext === "pdf") {
            return NextResponse.json(
                { success: false, error: "No cadastro, envie apenas imagens." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validar tamanho
        if (buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { success: false, error: "Arquivo muito grande. Limite máximo: 5 MB." },
                { status: 400 }
            );
        }

        // Define upload directory
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Sanitizar nome do arquivo e gerar nome único
        const safeExt = ext || "bin";
        const filename = `${randomUUID()}.${safeExt}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
