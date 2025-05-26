import { NextRequest, NextResponse } from 'next/server';

// Handler for GET requests to /api/admin/accounts
export async function GET(request: NextRequest) {
    return handleRequest(request, 'GET');
}

// Handler for POST requests to /api/admin/accounts
export async function POST(request: NextRequest) {
    return handleRequest(request, 'POST');
}

// Handler for PUT requests to /api/admin/accounts
export async function PUT(request: NextRequest) {
    return handleRequest(request, 'PUT');
}

// Handler for DELETE requests to /api/admin/accounts
export async function DELETE(request: NextRequest) {
    return handleRequest(request, 'DELETE');
}

// Handler for OPTIONS requests (for CORS preflight)
export async function OPTIONS(request: NextRequest) {
    return handleRequest(request, 'OPTIONS');
}

async function handleRequest(request: NextRequest, method: string) {
    // Use HTTP for the backend URL (not HTTPS)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.206.227.118';
    const url = `${backendUrl}/api/admin/accounts`;

    console.log(`[Admin API] Forwarding ${method} request to ${url}`);

    // Extract the authorization header or get it from cookies
    let authHeader = request.headers.get('authorization');

    if (!authHeader) {
        const authToken = request.cookies.get('authToken')?.value;
        if (authToken) {
            authHeader = `Bearer ${authToken}`;
            console.log('[Admin API] Using auth token from cookies');
        } else {
            console.log('[Admin API] No authorization found in header or cookies');
        }
    }

    // Setup headers for backend request
    const headers = new Headers();
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }
    headers.set('Content-Type', 'application/json');

    // Get request body for non-GET methods
    let body = null;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
        try {
            body = await request.json();
        } catch (e) {
            console.log('[Admin API] Request body is empty or not JSON');
        }
    }
    try {
        // Forward the request to backend with HTTP
        console.log(`Making fetch request to: ${url}`);
        console.log(`Method: ${method}`);
        console.log(`Headers: ${JSON.stringify(Object.fromEntries(headers.entries()))}`); const backendResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            duplex: 'half'
        } as RequestInit & { duplex: 'half' });

        console.log(`Backend response status: ${backendResponse.status}`);

        // Handle response based on content type
        const contentType = backendResponse.headers.get('content-type');
        let data;

        try {
            if (contentType && contentType.includes('application/json')) {
                data = await backendResponse.json();
            } else {
                const text = await backendResponse.text();
                console.log(`Non-JSON response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
                data = { message: text };
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            const text = await backendResponse.text();
            data = {
                message: 'Error parsing response',
                error: parseError instanceof Error ? parseError.message : String(parseError),
                responseText: text.substring(0, 500) // Include first 500 chars of response
            };
        }

        // Return response with appropriate status and CORS headers
        return NextResponse.json(data, {
            status: backendResponse.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('[Admin API] Error forwarding request to backend:', error);

        // Provide more detailed error information
        let errorMessage = 'Failed to connect to backend service';
        let errorDetails = '';

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.stack || '';
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
                url: url,
                method: method,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}