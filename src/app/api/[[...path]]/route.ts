import { NextRequest, NextResponse } from 'next/server';

// This is a catch-all API route handler that proxies requests to the backend
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'GET', path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'POST', path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'PUT', path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'DELETE', path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'PATCH', path);
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleApiRequest(request, 'OPTIONS', path);
}

async function handleApiRequest(
    request: NextRequest,
    method: string,
    pathSegments: string[]
) {  // Combine the path segments to form the backend API path
    const apiPath = pathSegments ? pathSegments.join('/') : '';

    // Use HTTP for the backend URL (not HTTPS)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Create the full URL for the backend request
    const url = `${backendUrl}/api/${apiPath}`;

    console.log(`API Gateway: Forwarding ${method} request to ${url}`);

    // Extract the authorization header from the incoming request
    let authHeader = request.headers.get('authorization');

    // If no Authorization header is found, check for the authToken cookie
    if (!authHeader) {
        const authToken = request.cookies.get('authToken')?.value;
        if (authToken) {
            authHeader = `Bearer ${authToken}`;
            console.log('API Gateway: Using auth token from cookies');
        } else {
            console.log('API Gateway: No authorization found in header or cookies');
        }
    } else {
        console.log('API Gateway: Using auth token from Authorization header');
    }

    // Create headers for the backend request
    const headers = new Headers();
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }
    headers.set('Content-Type', 'application/json');

    // Get the request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
        try {
            body = await request.json();
        } catch (e) {
            // Handle case where body is not JSON or empty
            console.log('API Gateway: Request body is empty or not JSON');
        }
    }
    try {
        // Forward the request to the backend
        console.log(`Making fetch request to: ${url}`);
        console.log(`Method: ${method}`);
        console.log(`Headers: ${JSON.stringify(Object.fromEntries(headers.entries()))}`); const backendResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            duplex: 'half'
        } as RequestInit & { duplex: 'half' });

        console.log(`Backend response status: ${backendResponse.status}`);

        // Handle non-JSON responses
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

        // Return the response with appropriate status and headers
        return NextResponse.json(data, {
            status: backendResponse.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Error forwarding request to backend:', error);

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