/**
 * 统一 API 客户端
 * - 自动携带 Cookie（HttpOnly token）
 * - 统一错误处理
 * - 类型安全
 */

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
    code: number;
}

export interface ApiFailure {
    success: false;
    error: string;
    code: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly code: number,
        public readonly status: number
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
        ...init,
        credentials: "include", // 携带 HttpOnly Cookie
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });

    let json: ApiResponse<T>;
    try {
        json = (await response.json()) as ApiResponse<T>;
    } catch {
        throw new ApiError(
            "服务器响应格式错误",
            response.status,
            response.status
        );
    }

    if (!response.ok || !json.success) {
        const error =
            "error" in json ? json.error : json.message ?? "请求失败";
        throw new ApiError(error, json.code, response.status);
    }

    return json.data;
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),

    post: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: "POST",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    put: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: "PUT",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
