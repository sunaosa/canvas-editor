import type { NextRequest } from "next/server";
import { userService } from "../services/user-service";
import { extractToken, verifyToken } from "./auth";

export interface AuthContext {
    userId: bigint;
    uuid: string;
    username: string;
}

/**
 * 受保护 API 的统一鉴权:验签 + 查库校验账号状态。
 * proxy 只拦截"没有 token"的请求、不验签,受保护 route 内必须调用本函数。
 * 返回 null 即未通过,统一按 401 处理(不区分原因,避免向未认证方泄露信息)。
 */
export async function requireAuth(
    request: NextRequest,
): Promise<AuthContext | null> {
    const cookieToken = request.cookies.get("token")?.value ?? null;
    const token = extractToken(
        request.headers.get("authorization"),
        cookieToken,
    );
    if (!token) {
        return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }

    const user = await userService.getByUuid(payload.sub);
    if (!user || user.status === 0) {
        return null;
    }

    return { userId: user.id, uuid: user.uuid, username: user.username };
}
