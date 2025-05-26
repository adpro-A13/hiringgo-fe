import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

export interface AuthTokens {
    authToken: string;
    expiresIn: number;
}

export interface User {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
}

export type LoginResponse = {
    token: string;
    expiresIn: number;
    user: User;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.206.227.118';

    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Authentication failed');
    }

    const data = await response.json();
    return data;
}

export async function register(userData: any): Promise<LoginResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Registration failed');
    }

    const data = await response.json();
    return data;
}

export async function verifyToken(token: string): Promise<User | null> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        });

        return payload as unknown as User;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export function setAuthCookies(tokens: AuthTokens): void {
    // This function should be used client-side
    document.cookie = `authToken=${tokens.authToken}; path=/; max-age=${tokens.expiresIn}; SameSite=Strict; Secure`;
}

export function clearAuthCookies(): void {
    // This function should be used client-side
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
}

export function getRedirectPathByRole(role: string): string {
    switch (role) {
        case 'ADMIN':
            return '/dashboard/admin';
        case 'DOSEN':
            return '/dashboard/dosen';
        case 'MAHASISWA':
            return '/dashboard/mahasiswa';
        default:
            return '/';
    }
}
