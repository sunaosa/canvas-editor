import { userRepository } from "../db/user";
import { hashPassword, verifyPassword, signToken } from "../utils/auth";
import type { User } from "@prisma/client";

export interface RegisterInput {
    username: string;
    email?: string | null;
    password: string;
    displayName?: string | null;
}

export interface LoginInput {
    username: string;
    password: string;
}

/** 对前端友好的用户对象（id 转 Number，无 BigInt/无密码） */
export type SafeUser = Omit<User, "passwordHash" | "id"> & {
    id: number;
};

export interface AuthResult {
    user: SafeUser;
    token: string;
}

export type ServiceError =
    | { code: "USERNAME_TAKEN"; message: string }
    | { code: "EMAIL_TAKEN"; message: string }
    | { code: "INVALID_CREDENTIALS"; message: string }
    | { code: "ACCOUNT_DISABLED"; message: string };

/**
 * 用户业务逻辑层
 * 串联 DB 操作 + 密码哈希 + JWT 签发
 */
export const userService = {
    /**
     * 注册新用户
     */
    async register(input: RegisterInput): Promise<AuthResult> {
        const existing = await userRepository.findByUsername(input.username);
        if (existing) {
            throw { code: "USERNAME_TAKEN", message: "用户名已被占用" } satisfies ServiceError;
        }

        if (input.email) {
            const existingEmail = await userRepository.findByEmail(input.email);
            if (existingEmail) {
                throw { code: "EMAIL_TAKEN", message: "邮箱已被注册" } satisfies ServiceError;
            }
        }

        const passwordHash = await hashPassword(input.password);
        const user = await userRepository.create({
            username: input.username,
            email: input.email || null,
            passwordHash,
            displayName: input.displayName || null,
        });

        return finalizeAuth(user);
    },

    /**
     * 用户登录（支持用户名或邮箱）
     */
    async login(input: LoginInput, ip: string | null): Promise<AuthResult> {
        const user = await userRepository.findByUsernameOrEmail(input.username);
        if (!user) {
            throw {
                code: "INVALID_CREDENTIALS",
                message: "用户名或密码错误",
            } satisfies ServiceError;
        }

        if (user.status === 0) {
            throw {
                code: "ACCOUNT_DISABLED",
                message: "账号已被禁用，请联系管理员",
            } satisfies ServiceError;
        }

        const ok = await verifyPassword(input.password, user.passwordHash);
        if (!ok) {
            throw {
                code: "INVALID_CREDENTIALS",
                message: "用户名或密码错误",
            } satisfies ServiceError;
        }

        await userRepository.updateLoginInfo(user.id, ip);
        return finalizeAuth(user);
    },

    /**
     * 根据 UUID 查询用户（用于 /api/auth/me）
     */
    async getByUuid(uuid: string) {
        return userRepository.findByUuid(uuid);
    },
};

/**
 * 内部辅助：剥离 passwordHash、转换 BigInt，并签发 JWT
 */
async function finalizeAuth(user: User): Promise<AuthResult> {
    const { passwordHash: _ignore, id: bigId, ...rest } = user;
    const safeUser: SafeUser = {
        ...rest,
        id: Number(bigId), // BigInt → Number，前端可直接使用
    };
    const token = signToken({
        uid: Number(bigId),
        sub: user.uuid,
        username: user.username,
    });
    return { user: safeUser, token };
}
