export function logout() {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
}

export function getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'authToken') {
            return value;
        }
    }
    return null;
}

export function setTokenCookie(token: string, maxAge: number = 7 * 24 * 60 * 60) {
    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}`;
}
