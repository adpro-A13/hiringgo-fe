import type { NextConfig } from "next";

/**
 * Next.js configuration optimized for both development and production
 */
const nextConfig: NextConfig = {
    // Enable detailed logging for debugging
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    
    // Webpack configuration - simplified for production compatibility
    webpack: (config, { dev, isServer }) => {
        // Only apply dev-specific configurations in development
        if (dev && !isServer) {
            // Basic HMR improvements for development only
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        
        // Production-safe webpack configurations
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        
        return config;
    },
    
    // Conditional rewrites - only for development
    async rewrites() {
        // Only apply rewrites in development
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: "/api/:path*",
                    destination: "http://localhost:8080/api/:path*",
                },
            ];
        }
        return [];
    },
    
    // Simplified headers for production compatibility
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true",
                    },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: process.env.NODE_ENV === 'production' 
                            ? process.env.ALLOWED_ORIGIN || "https://yourdomain.com"
                            : "*",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
                    },
                ],
            },
        ];
    },
    
    // Add output configuration for better compatibility
    output: 'standalone',
    
    // Disable ESLint during builds
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    // Disable TypeScript errors during builds (if needed)
    typescript: {
        ignoreBuildErrors: true,
    },
    
    // Experimental features that might cause issues - disable for stability
    experimental: {
        esmExternals: false,
    },
};

export default nextConfig;