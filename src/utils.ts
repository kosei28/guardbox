export function base64ToBytes(base64: string): Uint8Array {
    const str = atob(base64);
    const chars = [...str].map((v) => v.charCodeAt(0));
    const bytes = Uint8Array.from(chars);
    return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
    const str = String.fromCharCode.apply(null, [...bytes]);
    const base64 = btoa(str);
    return base64;
}

export function base64urlToBytes(base64url: string): Uint8Array {
    const base64 = base64urlToBase64(base64url);
    const bytes = base64ToBytes(base64);
    return bytes;
}

export function bytesToBase64url(bytes: Uint8Array): string {
    const base64 = bytesToBase64(bytes);
    const base64url = base64ToBase64url(base64);
    return base64url;
}

export function base64ToBase64url(base64: string) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/g, '');
}

export function base64urlToBase64(base64url: string) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding > 0) {
        return base64 + '===='.slice(padding);
    }
    return base64;
}
