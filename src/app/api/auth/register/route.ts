import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, fullName, nim } = body;

        if (!email || !password || !confirmPassword || !fullName || !nim) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'Passwords do not match' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const endpoint = `${backendUrl}/api/auth/register`;
        const userData = {
            email,
            password,
            confirmPassword,
            fullName,
            nim
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json(); if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: data.message ?? data.error ?? 'Registration failed'
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: data
        });

    } catch (error: any) {
        console.error('Registration API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message ?? 'Internal server error'
            },
            { status: 500 }
        );
    }
}