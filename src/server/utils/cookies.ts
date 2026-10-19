import type { NextResponse } from "next/server";

const TOKEN_COOKIE = "token";

/** JWT_EXPIRES_IN 解析失败时的兜底有效期(7 天) */
const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * 解析 JWT_EXPIRES_IN(如 "7d"/"12h"/"30m"/"3600s")为秒数。
 * 只支持"数字+单位"的简写格式,其余格式走兜底值。
 */
function parseExpirySeconds(expiresIn: string | undefined): number {
    const match = /^(\d+)([smhd])$/.exec((expiresIn ?? "").trim());
    if (!match) {
        return DEFAULT_MAX_AGE_SECONDS;
    }
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return Number(match[1]) * units[match[2]];
}

/** 登录/注册成功后下发 HttpOnly token cookie,有效期与 JWT_EXPIRES_IN 同源 */
export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set(TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: parseExpirySeconds(process.env.JWT_EXPIRES_IN),
        path: "/",
    });
}

/** 退出登录:立即过期 token cookie */
export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set(TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}
