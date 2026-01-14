import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: fileName } = await params;
  const UPLOAD_DIR = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(process.cwd(), 'uploads');
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    const fileBuffer = await fs.readFile(filePath);
    
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.txt': 'text/plain',
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const isDownload = request.nextUrl.searchParams.get("download") === "1";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": isDownload 
          ? `attachment; filename="${fileName}"` 
          : `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
