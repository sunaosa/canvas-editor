import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    code?: number;
}

/**
 * JSON.stringify 兜底：BigInt 安全序列化
 * Prisma 查出的 BIGINT 字段是 BigInt 类型，无法直接 JSON.stringify
 */
function jsonReplacer(_key: string, value: unknown): unknown {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}

/**
 * 把数据中的所有 BigInt 转换为 string（防止 JSON.stringify 报错）
 */
function safeJson<T>(data: T): string {
    return JSON.stringify(data, jsonReplacer);
}

/**
 * 统一响应拦截器
 * 自动添加 success、timestamp 等通用字段
 * 自动处理 BigInt 序列化
 */
export class ResponseInterceptor {
    /**
     * 成功响应
     */
    static success<T>(
        data?: T,
        message?: string,
    ): NextResponse<ApiResponse<T>> {
        const body = safeJson({
            success: true,
            message: message ?? "请求成功",
            data,
            code: 200,
        });
        return new NextResponse(body, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    /**
     * 成功响应（带自定义消息）
     */
    static ok(message: string, data?: unknown): NextResponse<ApiResponse> {
        const body = safeJson({
            success: true,
            message,
            data,
            code: 200,
        });
        return new NextResponse(body, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    /**
     * 错误响应
     */
    static error(
        message: string = "服务器内部错误",
        status: number = 500,
    ): NextResponse<ApiResponse> {
        const body = safeJson({
            success: false,
            error: message,
            code: status,
        });
        return new NextResponse(body, {
            status,
            headers: { "Content-Type": "application/json" },
        });
    }

    /**
     * 业务错误响应（如参数错误、业务逻辑错误）
     */
    static badRequest(
        message: string = "请求参数错误",
    ): NextResponse<ApiResponse> {
        return ResponseInterceptor.error(message, 400);
    }

    /**
     * 未授权响应
     */
    static unauthorized(message: string = "未授权"): NextResponse<ApiResponse> {
        return ResponseInterceptor.error(message, 401);
    }

    /**
     * 404 响应
     */
    static notFound(message: string = "资源未找到"): NextResponse<ApiResponse> {
        return ResponseInterceptor.error(message, 404);
    }

    /**
     * 统一处理 try-catch 的错误包装
     */
    static catch(error: unknown): NextResponse<ApiResponse> {
        console.error("API Error:", error);
        // 生产环境不透传内部错误消息(可能含表名/SQL 等敏感信息),细节只留在服务端日志
        const message =
            process.env.NODE_ENV === "production"
                ? "服务器内部错误"
                : error instanceof Error
                  ? error.message
                  : "未知错误";
        return ResponseInterceptor.error(message, 500);
    }
}
