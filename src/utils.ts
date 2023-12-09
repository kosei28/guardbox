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
