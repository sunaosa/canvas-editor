import { NextRequest } from "next/server";
import { extractToken, verifyToken } from "@/server/utils/auth";
import { userService } from "@/server/services/user-service";
import { ResponseInterceptor } from "@/server/utils/response";

export async function GET(request: NextRequest) {
    try {
        const cookieToken = request.cookies.get("token")?.value ?? null;
        const token = extractToken(request.headers.get("authorization"), cookieToken);
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

        // 仅返回必要字段
        return ResponseInterceptor.success(
            {
                id: Number(user.id),
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                status: user.status,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
            "获取成功"
        );
    } catch (error) {
        return ResponseInterceptor.catch(error);
    }
}
