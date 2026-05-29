/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.129", "localhost", "127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/login.txt",
        destination: "/login",
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
