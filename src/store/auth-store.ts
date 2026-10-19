import { create } from "zustand";
import { ApiError, api } from "@/lib/api";

/** 对外暴露的用户信息（不含 passwordHash） */
export interface AuthUser {
    id: number;
    uuid: string;
    username: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    /** 0=禁用 1=正常,与数据库 SmallInt 一致 */
    status: number;
    lastLoginAt: string | null;
    createdAt: string;
}

interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    initialized: boolean;
    /** fetchMe 失败且非 401(网络/服务异常)时为 true,避免把服务故障误判成未登录 */
    authError: boolean;

    /** 从后端拉取当前用户（用于初始化/刷新） */
    fetchMe: () => Promise<void>;
    /** 设置用户（如登录成功后） */
    setUser: (user: AuthUser | null) => void;
    /** 清空本地状态 */
    clear: () => void;
    /** 调用后端 /api/auth/logout */
    logout: () => Promise<void>;
}

/**
 * 认证状态管理
 * 注意：token 存放在 HttpOnly Cookie 中，前端无法读取也不需要读取
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    initialized: false,
    authError: false,

    async fetchMe() {
        set({ loading: true, authError: false });
        try {
            const user = await api.get<AuthUser>("/api/auth/me");
            set({ user, initialized: true, loading: false });
        } catch (error) {
            // 401 = 未登录,属正常态;其他错误是网络/服务异常,不应当成"已退出登录"
            const isUnauthorized =
                error instanceof ApiError && error.status === 401;
            set({
                user: null,
                initialized: true,
                loading: false,
                authError: !isUnauthorized,
            });
        }
    },

    setUser(user) {
        set({ user, initialized: true, authError: false });
    },

    clear() {
        set({ user: null, initialized: true, authError: false });
    },

    async logout() {
        try {
            await api.post("/api/auth/logout");
        } finally {
            set({ user: null });
        }
    },
}));
