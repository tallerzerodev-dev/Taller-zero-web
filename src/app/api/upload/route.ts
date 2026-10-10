import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/require-admin';
import {
  UPLOAD_FOLDER,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/lib/upload-rules';

// Configuramos Cloudinary con las variables que pusimos en .env.local
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se procesó ningún archivo' }, { status: 400 });
    }

    // 1. Validar tipo de archivo. Algunos navegadores no informan el tipo de un .mov,
    // por eso si viene vacío o genérico se decide por la extensión; Cloudinary valida
    // después el contenido real con allowed_formats.
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const hasGenericType = file.type === '' || file.type === 'application/octet-stream';
    const isImage = IMAGE_MIME_TYPES.includes(file.type) || (hasGenericType && IMAGE_FORMATS.includes(extension));
    const isVideo = VIDEO_MIME_TYPES.includes(file.type) || (hasGenericType && VIDEO_FORMATS.includes(extension));

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Tipo de archivo no soportado. Solo JPG, PNG, WEBP, GIF, MP4, MOV y WEBM.' }, { status: 415 });
    }

    // 2. Validar el tamaño del archivo
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `El archivo excede el límite de ${maxBytes / (1024 * 1024)}MB` }, { status: 413 });
    }

    // Convertimos el archivo web a un Buffer de Node.js para que Cloudinary pueda leerlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subimos el archivo a Cloudinary abriendo un stream
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: UPLOAD_FOLDER, // Guarda todo ordenado en una carpeta en tu nube
          resource_type: 'auto',  // Detecta automáticamente si es imagen, gif o video
          allowed_formats: isVideo ? VIDEO_FORMATS : IMAGE_FORMATS,
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Devolvemos la URL segura que nos generó Cloudinary
    return NextResponse.json({ url: result.secure_url });

  } catch (error) {
    console.error('Error subiendo archivo a Cloudinary:', error);
    return NextResponse.json({ error: 'Fallo la subida del archivo' }, { status: 500 });
  }
}
