import { NextRequest } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user-service";
import { ResponseInterceptor } from "@/server/utils/response";

const loginSchema = z.object({
    username: z.string().min(1, "用户名不能为空"),
    password: z.string().min(1, "密码不能为空"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return ResponseInterceptor.badRequest(parsed.error.issues[0]?.message ?? "请求参数错误");
        }

        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            null;

        const { user, token } = await userService.login(parsed.data, ip);

        const response = ResponseInterceptor.success({ user, token }, "登录成功");
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return response;
    } catch (error) {
        return handleServiceError(error);
    }
}

function handleServiceError(error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
        const e = error as { code: string; message: string };
        if (e.code === "INVALID_CREDENTIALS" || e.code === "ACCOUNT_DISABLED") {
            return ResponseInterceptor.unauthorized(e.message);
        }
    }
    return ResponseInterceptor.catch(error);
}
