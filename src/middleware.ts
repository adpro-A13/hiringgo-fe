import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

type JWTPayload = {
    role: string;
    id: string;
    email: string;
    sub: string;
    exp: number;
    iat: number;
    fullName?: string;
    nim?: string;
    nip?: string;
    tokenVersion?: number;
};

// Role-based access control configuration
const RBAC_CONFIG: Record<string, string[]> = {
    '/dashboard/admin': ['ADMIN'],
    '/dashboard/dosen': ['DOSEN'],
    '/dashboard/mahasiswa': ['MAHASISWA'],
};

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`Middleware running for path: ${pathname}`);

    // Skip middleware for API routes, static files, and public routes
    if (pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('authToken')?.value ?? request.cookies.get('token')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const accessToken = cookieToken ?? headerToken;

    console.log(`Auth token present: ${!!accessToken}`);

    // Redirect to login if no token
    if (!accessToken) {
        console.log(`Redirecting to login from: ${pathname}`);
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl, { status: 302 });
    }

    try {
        // Verify JWT token
        const secret = Buffer.from('88a999321bf31911fa4aad5379bae1d69f78ca7a4774c6db5ebd00388746768b', 'base64');
        const { payload } = await jwtVerify<JWTPayload>(accessToken, secret, {
            algorithms: ['HS256'],
        });

        const userRole = payload?.role;
        const userId = payload?.id;

        if (!userRole || !userId) {
            throw new Error('Invalid token: missing required claims');
        }

        console.log(`User authenticated: ${userId}, Role: ${userRole}`);

        if (pathname === '/') {
            let redirectPath = '/login';
            if (userRole === 'ADMIN') redirectPath = '/dashboard/admin';
            else if (userRole === 'DOSEN') redirectPath = '/dashboard/dosen';
            else if (userRole === 'MAHASISWA') redirectPath = '/dashboard/mahasiswa';

            if (redirectPath !== '/login') {
                return NextResponse.redirect(new URL(redirectPath, request.url));
            }
        }

        // Check role-based access for protected routes
        const pathMatch = Object.entries(RBAC_CONFIG).find(([path]) =>
            pathname.startsWith(path)
        );

        if (pathMatch) {
            const [, requiredRoles] = pathMatch;
            const hasPermission = requiredRoles.includes(userRole);

            if (!hasPermission) {
                console.log(`Access denied for role ${userRole} to path ${pathname}`);
                // Redirect to appropriate dashboard
                let redirectPath = '/login';
                if (userRole === 'ADMIN') redirectPath = '/dashboard/admin';
                else if (userRole === 'DOSEN') redirectPath = '/dashboard/dosen';
                else if (userRole === 'MAHASISWA') redirectPath = '/dashboard/mahasiswa';

                return NextResponse.redirect(new URL(redirectPath, request.url));
            }
        }

        // Redirect authenticated users away from auth pages
        if (PUBLIC_ROUTES.includes(pathname)) {
            console.log(`Authenticated user accessing auth page, redirecting based on role: ${userRole}`);
            let redirectPath = '/';
            if (userRole === 'ADMIN') redirectPath = '/dashboard/admin';
            else if (userRole === 'DOSEN') redirectPath = '/dashboard/dosen';
            else if (userRole === 'MAHASISWA') redirectPath = '/dashboard/mahasiswa';

            return NextResponse.redirect(new URL(redirectPath, request.url));
        }

        // Add user info to headers for components to use
        const response = NextResponse.next();
        response.headers.set('x-user-id', userId);
        response.headers.set('x-user-role', userRole);
        response.headers.set('x-user-email', payload.email || '');
        if (payload.fullName) response.headers.set('x-user-name', payload.fullName);

        return response;

    } catch (error) {
        console.error('JWT verification failed:', error);

        // Clear invalid token and redirect to login
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl, { status: 302 });
        response.cookies.delete('authToken');
        response.cookies.delete('token');

        return response;
    }
}

export const config = {
    matcher: [
        '/', // Explicit match for root path
        '/dashboard/:path*', // All dashboard pages
        '/((?!login|register|api|_next/static|_next/image|favicon.ico).*)',
    ],
};