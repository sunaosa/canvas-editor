/**
 * 校验登录后的跳转地址,只放行站内路径。
 * 防止开放重定向:/login?redirect=https://evil.com 或 //evil.com 被用来钓鱼。
 */
export function safeRedirect(
    raw: string | null | undefined,
    fallback = "/chat",
): string {
    if (raw?.startsWith("/") && !raw.startsWith("//")) {
        return raw;
    }
    return fallback;
}
