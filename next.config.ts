// filepath: c:\Kuliah\SEM 4\Adpro\Hiringgo\Fe DesPattern Adpr\next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:8080/api/:path*",
            },
        ];
    },
};

export default nextConfig;