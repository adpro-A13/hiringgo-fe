import jwt from 'jsonwebtoken';
import { toast } from 'sonner';

interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    tokenVersion: number;
    exp: number;
    iat: number;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWTToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.decode(token) as JWTPayload;
        if (!decoded || typeof decoded !== 'object') {
            console.error('Invalid token format');
            return null;
        }
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Gets the current token version from the backend for a user
 * @param userId - User ID to check token version for
 * @returns Promise resolving to current token version or null if error
 */
export async function getCurrentTokenVersion(userId: string): Promise<number | null> {
    try {
        const response = await fetch(`/api/auth/token-version/${userId}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to fetch token version:', response.status);
            return null;
        }

        const data = await response.json();
        return data.tokenVersion ?? null;
    } catch (error) {
        console.error('Error fetching token version:', error);
        return null;
    }
}

/**
 * Validates if the current JWT token version matches the backend version
 * @param token - JWT token to validate
 * @returns Promise resolving to true if valid, false if invalid
 */
export async function validateTokenVersion(token: string): Promise<boolean> {
    const decoded = decodeJWTToken(token);
    if (!decoded) {
        return false;
    }

    const currentVersion = await getCurrentTokenVersion(decoded.userId);
    if (currentVersion === null) {
        return false;
    }

    return decoded.tokenVersion === currentVersion;
}

/**
 * Logs out the user by clearing tokens and redirecting to login
 */
export function logoutUser(): void {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear cookies by setting them to expire
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Show logout message
    toast.info('You have been logged out due to account changes.');

    // Redirect to login page
    window.location.href = '/login';
}

/**
 * Checks token version and logs out if invalid
 * @param token - JWT token to check
 * @returns Promise resolving to true if valid, false if logged out
 */
export async function checkTokenVersionAndLogout(token: string): Promise<boolean> {
    const isValid = await validateTokenVersion(token);
    if (!isValid) {
        logoutUser();
        return false;
    }
    return true;
}

/**
 * Starts periodic token version checking
 * @param token - JWT token to monitor
 * @param intervalMs - Check interval in milliseconds (default: 5 minutes)
 * @returns Function to stop the periodic checking
 */
export function startTokenVersionChecking(token: string, intervalMs: number = 5 * 60 * 1000): () => void {
    const intervalId = setInterval(async () => {
        await checkTokenVersionAndLogout(token);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
}

/**
 * Get token from localStorage with validation
 * @returns Valid token string or null
 */
export function getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const decoded = decodeJWTToken(token);
        if (!decoded) return null;

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }

        return token;
    } catch (error) {
        console.error('Error getting token from storage:', error);
        return null;
    }
}

/**
 * Store token in localStorage and cookies
 * @param token - JWT token to store
 */
export function storeToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('token', token);

        // Also set as httpOnly cookie for server-side access
        const decoded = decodeJWTToken(token);
        if (decoded) {
            const expireDate = new Date(decoded.exp * 1000);
            document.cookie = `token=${token}; path=/; expires=${expireDate.toUTCString()}; secure; samesite=strict`;
        }
    } catch (error) {
        console.error('Error storing token:', error);
    }
}
