import type { NextRequest } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user-service";
import { setAuthCookie } from "@/server/utils/cookies";
import { ResponseInterceptor } from "@/server/utils/response";
import { toErrorResponse } from "@/server/utils/service-error";

const loginSchema = z.object({
    username: z.string().min(1, "用户名不能为空"),
    password: z.string().min(1, "密码不能为空"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return ResponseInterceptor.badRequest(
                parsed.error.issues[0]?.message ?? "请求参数错误",
            );
        }

        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            null;

        const { user, token } = await userService.login(parsed.data, ip);

        // token 只通过 HttpOnly Cookie 下发,不放进响应体(防 XSS 读取)
        const response = ResponseInterceptor.success({ user }, "登录成功");
        setAuthCookie(response, token);
        return response;
    } catch (error) {
        return toErrorResponse(error);
    }
}
