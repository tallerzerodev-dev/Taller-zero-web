/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['cloudinary'],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    async headers() {
        // Detectar entorno de desarrollo
        const isDev = process.env.NODE_ENV !== 'production';
        // Agregar ws://127.0.0.1:* y ws://localhost:* a connect-src solo en dev
        const connectSrc = isDev
            ? "'self' https://api.mercadopago.com https://accounts.google.com https://api.cloudinary.com ws://127.0.0.1:* ws://localhost:*"
            : "'self' https://api.mercadopago.com https://accounts.google.com https://api.cloudinary.com";
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src ${connectSrc} blob:; frame-src https://sdk.mercadopago.com https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' https://res.cloudinary.com; worker-src 'self' blob:;`,
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
