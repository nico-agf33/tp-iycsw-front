/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  /// autorizar ip de red local
  allowedDevOrigins: ['192.168.1.51', 'localhost'],
  
  /// forzar a Next.js a incrustar de forma estática las variables dentro del build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_USUARIO_ID: process.env.NEXT_PUBLIC_USUARIO_ID,
  },
}

export default nextConfig;
