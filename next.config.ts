import type { NextConfig } from "next";

/**
 * Next.js configuration with enhanced CORS handling 
 * and improved WebSocket connectivity for development
 */
const nextConfig: NextConfig = {
    // Enable detailed logging for debugging
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    // Add webpack configuration for better HMR
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            // Improve HMR and WebSocket stability
            config.devServer = {
                ...(config.devServer || {}),
                hot: true,
                // Disable using hash for HMR which causes the __next_hmr_refresh_hash__ issue
                liveReload: true,
                // Increase WebSocket timeout
                client: {
                    overlay: false,
                    webSocketURL: {
                        hostname: "localhost",
                        pathname: "/_next/webpack-hmr",
                        port: "3000",
                    },
                },
            };

            // Optimize HMR chunks
            if (config.optimization && config.optimization.splitChunks) {
                config.optimization.splitChunks = {
                    ...config.optimization.splitChunks,
                    cacheGroups: {
                        ...(config.optimization.splitChunks as any).cacheGroups,
                        // Prevent HMR hash issues by keeping React in a single chunk
                        framework: {
                            name: 'framework',
                            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                            priority: 40,
                            chunks: 'all',
                        },
                    },
                };
            }
        }
        return config;
    },
    // Proxy API requests to avoid CORS issues
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:8080/api/:path*",
                // Add custom header to the proxied request
                has: [
                    {
                        type: 'header',
                        key: 'host',
                    }
                ]
            },
        ];
    },
    /* Middleware removed due to type issues */
    // Add comprehensive headers to handle CORS issues
    async headers() {
        return [
            {
                // Apply these headers to all routes
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true",
                    },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*", // In production, replace with specific origin
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
};

