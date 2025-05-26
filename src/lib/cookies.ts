export function setCookie(name: string, value: string, options: {
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
} = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.path) cookieString += `; path=${options.path}`;
    if (options.secure) cookieString += `; secure`;
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;

    document.cookie = cookieString;
    return cookieString;
}

export function getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

export function deleteCookie(name: string, path: string = '/') {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
