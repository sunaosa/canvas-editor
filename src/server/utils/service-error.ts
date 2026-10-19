import type { NextResponse } from "next/server";
import { ResponseInterceptor } from "./response";

/** ServiceError 的 code → HTTP 状态码映射 */
const CODE_STATUS: Record<string, number> = {
    USERNAME_TAKEN: 400,
    EMAIL_TAKEN: 400,
    INVALID_CREDENTIALS: 401,
    ACCOUNT_DISABLED: 401,
};

/**
 * 把 service 抛出的 { code, message } 转成对应的 HTTP 错误响应。
 * 不是 ServiceError 的未知异常统一走 catch(500 + 服务端日志)。
 */
export function toErrorResponse(error: unknown): NextResponse {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string" &&
        (error as { code: string }).code in CODE_STATUS
    ) {
        const e = error as { code: string; message?: string };
        return ResponseInterceptor.error(
            e.message ?? "请求错误",
            CODE_STATUS[e.code],
        );
    }
    return ResponseInterceptor.catch(error);
}
