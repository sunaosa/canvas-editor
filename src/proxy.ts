import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 代理（原 middleware 已废弃）
 *
 * 保护需要登录的路由：
 * - /chat         对话页面
 * - /api/chat     聊天 API
 *
 * 公开路由：
 * - /login
 * - /api/auth/*
 * - /_next/*
 * - 静态资源
 */

// 受保护的路由前缀
const PROTECTED_PREFIXES = ["/chat", "/api/chat"];

// 公开路由前缀（明确放行）
const PUBLIC_PREFIXES = ["/login", "/api/auth", "/_next", "/favicon"];

function isProtected(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

function isPublic(pathname: string): boolean {
    return PUBLIC_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 公开路由直接放行
    if (isPublic(pathname)) {
        return NextResponse.next();
    }

    // 检查受保护路由的 token
    if (isProtected(pathname)) {
        const token =
            request.cookies.get("token")?.value ||
            request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

        if (!token) {
            // API 路由返回 401，页面路由重定向到登录
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { success: false, error: "未授权", code: 401 },
                    { status: 401 }
                );
            }
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // 匹配所有路径，排除静态资源
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
