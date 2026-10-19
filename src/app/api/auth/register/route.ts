import type { NextRequest } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user-service";
import { setAuthCookie } from "@/server/utils/cookies";
import { ResponseInterceptor } from "@/server/utils/response";
import { toErrorResponse } from "@/server/utils/service-error";

const registerSchema = z.object({
    username: z
        .string()
        .min(3, "用户名至少 3 个字符")
        .max(50, "用户名最多 50 个字符")
        .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线、短横线"),
    email: z
        .string()
        .email("邮箱格式不正确")
        .max(255)
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .min(6, "密码至少 6 个字符")
        .max(100, "密码最多 100 个字符"),
    displayName: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return ResponseInterceptor.badRequest(
                parsed.error.issues[0]?.message ?? "请求参数错误",
            );
        }

        const { user, token } = await userService.register(parsed.data);

        // token 只通过 HttpOnly Cookie 下发,不放进响应体(防 XSS 读取)
        const response = ResponseInterceptor.success({ user }, "注册成功");
        setAuthCookie(response, token);
        return response;
    } catch (error) {
        return toErrorResponse(error);
    }
}
