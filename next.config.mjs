/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL('https://acgv6rf1fjszzutq.public.blob.vercel-storage.com/**'),
        ],
    },
};

export default nextConfig;
