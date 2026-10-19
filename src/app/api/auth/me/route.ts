import type { NextRequest } from "next/server";
import { toSafeUser, userService } from "@/server/services/user-service";
import { extractToken, verifyToken } from "@/server/utils/auth";
import { ResponseInterceptor } from "@/server/utils/response";

export async function GET(request: NextRequest) {
    try {
        const cookieToken = request.cookies.get("token")?.value ?? null;
        const token = extractToken(
            request.headers.get("authorization"),
            cookieToken,
        );
        if (!token) {
            return ResponseInterceptor.unauthorized("未登录");
        }

        const payload = verifyToken(token);
        if (!payload) {
            return ResponseInterceptor.unauthorized("登录已过期，请重新登录");
        }

        const user = await userService.getByUuid(payload.sub);
        if (!user) {
            return ResponseInterceptor.unauthorized("用户不存在");
        }
        if (user.status === 0) {
            return ResponseInterceptor.unauthorized("账号已被禁用");
        }

        // 复用 toSafeUser,避免再手写一份字段挑选(与 login/register 保持同构)
        return ResponseInterceptor.success(toSafeUser(user), "获取成功");
    } catch (error) {
        return ResponseInterceptor.catch(error);
    }
}
