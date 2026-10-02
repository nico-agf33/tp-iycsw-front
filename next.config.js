/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // autorizar ip de red local
  allowedDevOrigins: ['192.168.1.51', 'localhost'],
}
export default nextConfig;