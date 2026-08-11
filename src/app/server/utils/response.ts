import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    code?: number;
}

/**
 * 统一响应拦截器
 * 自动添加 success、timestamp 等通用字段
 */
export class ResponseInterceptor {
    /**
     * 成功响应
     */
    static success<T>(data?: T, message?: string): NextResponse<ApiResponse<T>> {
        return NextResponse.json(
            {
                success: true,
                message: message ?? "请求成功",
                data,
                code: 200,
            },
            { status: 200 }
        );
    }

    /**
     * 成功响应（带自定义消息）
     */
    static ok(message: string, data?: unknown): NextResponse<ApiResponse> {
        return NextResponse.json(
            {
                success: true,
                message,
                data,
                code: 200,
            },
            { status: 200 }
        );
    }

    /**
     * 错误响应
     */
    static error(
        message: string = "服务器内部错误",
        status: number = 500
    ): NextResponse<ApiResponse> {
        return NextResponse.json(
            {
                success: false,
                error: message,
                code: status,
            },
            { status }
        );
    }

    /**
     * 业务错误响应（如参数错误、业务逻辑错误）
     */
    static badRequest(message: string = "请求参数错误"): NextResponse<ApiResponse> {
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
        const message = error instanceof Error ? error.message : "未知错误";
        return ResponseInterceptor.error(message, 500);
    }
}
