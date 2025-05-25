import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', errorText);
            return NextResponse.json(
                { error: `Backend returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            );
        }

        let data;
        try {
            data = await response.json();
        } catch (error) {
            console.error('Failed to parse JSON response from backend:', error);
            return NextResponse.json(
                { error: 'Invalid JSON response from backend' },
                { status: 500 }
            );
        }

        const authToken = data.token;
        const nextResponse = NextResponse.json({
            success: true,
            token: authToken,
            user: data.user,
            message: 'Authentication successful'
        });

        if (authToken) {
            const rememberMe = body.rememberMe === true;
            const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

            nextResponse.cookies.set({
                name: 'authToken',
                value: authToken,
                path: '/',
                maxAge: maxAge,
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            console.log('Cookie set server-side for token:', authToken.substring(0, 10) + '...');
        }

        return nextResponse;
    } catch (error) {
        console.error('Authentication proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to authenticate with backend service' },
            { status: 500 }
        );
    }
}
