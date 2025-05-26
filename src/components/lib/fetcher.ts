import { NextRequest } from "next/server";


interface GeneralResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T
    timestamp?: string;
}

export const fetcher = async <T>(
    requestedUrl: string,
    request?: NextRequest,
    options: RequestInit = {}
): Promise<T> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.206.227.118';

    // For client-side requests, use Next.js API routes as proxy to avoid CORS issues
    let url: string;
    if (typeof window !== 'undefined' && !requestedUrl.startsWith('http')) {
        // Client-side: use relative URLs that go through Next.js API routes
        url = requestedUrl;
    } else if (request && !requestedUrl.startsWith('http')) {
        // Server-side: use full backend URL
        url = `${backendUrl}${requestedUrl}`;
    } else {
        // Already a full URL
        url = requestedUrl;
    }

    let authHeader: string | null = null;

    const headers = options.headers as Record<string, string> | undefined;
    if (headers?.['Authorization'] || headers?.['authorization']) {
        authHeader = headers['Authorization'] || headers['authorization'];
    }

    if (!authHeader) {
        if (request) {
            authHeader = request.headers.get('authorization');
            const authCookie = request.cookies.get('authToken');
            if (!authHeader && authCookie?.value) {
                authHeader = `Bearer ${authCookie.value}`;
            }
        } else if (typeof window !== 'undefined') {
            // Check cookies for client-side requests
            const cookies = document.cookie.split(';');
            const authTokenCookie = cookies.find(cookie => 
                cookie.trim().startsWith('authToken=')
            );
            
            if (authTokenCookie) {
                const cookieValue = authTokenCookie.split('=')[1]?.trim();
                if (cookieValue && cookieValue !== '') {
                    authHeader = `Bearer ${cookieValue}`;
                }
            }
        }
    }

    const requestHeaders = new Headers(options.headers);
    requestHeaders.set('Content-Type', 'application/json');
    if (authHeader) {
        requestHeaders.set('Authorization', authHeader);
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers: requestHeaders,
        credentials: 'include'
    };

    if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        (fetchOptions as any).duplex = 'half';
    }

    try {
        const response = await fetch(url, fetchOptions);

        const contentType = response.headers.get('content-type');
        let data: any = null;

        if (response.status === 204) {
            data = null;
        } else if (contentType?.includes('application/json')) {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw {
                status: response.status,
                message: data?.message || data?.error || data || `HTTP ${response.status}`,
                data
            };
        }

        return data;
    } catch (error: any) {
        if (error.status) {
            throw error;
        }
        throw {
            status: 500,
            message: error.message || 'Network error',
            data: null
        };
    }
}