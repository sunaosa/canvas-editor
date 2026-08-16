import { create } from "zustand";
import { api } from "@/lib/api";

/** 对外暴露的用户信息（不含 passwordHash） */
export interface AuthUser {
    id: number;
    uuid: string;
    username: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    status: string;
    lastLoginAt: string | null;
    createdAt: string;
}

interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    initialized: boolean;

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

    async fetchMe() {
        set({ loading: true });
        try {
            const user = await api.get<AuthUser>("/api/auth/me");
            set({ user, initialized: true, loading: false });
        } catch {
            set({ user: null, initialized: true, loading: false });
        }
    },

    setUser(user) {
        set({ user, initialized: true });
    },

    clear() {
        set({ user: null, initialized: true });
    },

    async logout() {
        try {
            await api.post("/api/auth/logout");
        } finally {
            set({ user: null });
        }
    },
}));
