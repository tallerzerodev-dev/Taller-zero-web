import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configuramos Cloudinary con las variables que pusimos en .env.local
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se procesó ningún archivo' }, { status: 400 });
    }

    // Convertimos el archivo web a un Buffer de Node.js para que Cloudinary pueda leerlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subimos el archivo a Cloudinary abriendo un stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'taller-zero', // Guarda todo ordenado en una carpeta en tu nube
          resource_type: 'auto'  // Detecta automáticamente si es imagen, gif o video
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Devolvemos la URL segura que nos generó Cloudinary
    return NextResponse.json({ url: (result as any).secure_url });

  } catch (error) {
    console.error('Error subiendo archivo a Cloudinary:', error);
    return NextResponse.json({ error: 'Fallo la subida del archivo' }, { status: 500 });
  }
}
