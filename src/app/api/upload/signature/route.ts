import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/require-admin';
import { UPLOAD_FOLDER, VIDEO_FORMATS } from '@/lib/upload-rules';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    // Todo lo firmado queda fijo: el cliente debe enviar exactamente estos valores
    // o Cloudinary rechaza la subida.
    const allowedFormats = VIDEO_FORMATS.join(',');
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: UPLOAD_FOLDER,
        allowed_formats: allowedFormats,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder: UPLOAD_FOLDER,
      allowedFormats,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json({ error: 'Error generating signature' }, { status: 500 });
  }
}
