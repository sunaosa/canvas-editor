import type { User } from "@prisma/client";
import { userRepository } from "../db/user";
import { hashPassword, signToken, verifyPassword } from "../utils/auth";

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
 * 抹平"用户不存在"路径的 bcrypt 耗时,
 * 防止通过登录接口的响应时间差异枚举已注册用户名。
 */
const DUMMY_PASSWORD_HASH =
    "$2b$10$Bc4tJJBRMOClDI20B0vNP.3EZg0CTcgqiKy6MZwLuL9q8fRR7Aq8i";

/** Prisma P2002 = 唯一约束冲突;按 code 做 duck-typing,避免跨版本 instanceof 差异 */
function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: unknown }).code === "P2002"
    );
}

/**
 * 剥离 passwordHash、BigInt id 转 number。
 * login/register/me 等所有返回用户对象的路径统一复用,避免多处手写字段挑选。
 */
export function toSafeUser(user: User): SafeUser {
    const { passwordHash: _ignored, id: bigId, ...rest } = user;
    return { ...rest, id: Number(bigId) };
}

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
            throw {
                code: "USERNAME_TAKEN",
                message: "用户名已被占用",
            } satisfies ServiceError;
        }

        if (input.email) {
            const existingEmail = await userRepository.findByEmail(input.email);
            if (existingEmail) {
                throw {
                    code: "EMAIL_TAKEN",
                    message: "邮箱已被注册",
                } satisfies ServiceError;
            }
        }

        const passwordHash = await hashPassword(input.password);
        let user: User;
        try {
            user = await userRepository.create({
                username: input.username,
                email: input.email || null,
                passwordHash,
                displayName: input.displayName || null,
            });
        } catch (error) {
            // 并发注册同名/同邮箱时撞数据库唯一约束(check-then-create 的竞态兜底)
            if (isUniqueViolation(error)) {
                throw {
                    code: "USERNAME_TAKEN",
                    message: "用户名或邮箱已被占用",
                } satisfies ServiceError;
            }
            throw error;
        }

        return finalizeAuth(user);
    },

    /**
     * 用户登录（支持用户名或邮箱）
     */
    async login(input: LoginInput, ip: string | null): Promise<AuthResult> {
        const user = await userRepository.findByUsernameOrEmail(input.username);
        if (!user) {
            // 同样执行一次 bcrypt 比较,与"密码错误"路径保持相近耗时
            await verifyPassword(input.password, DUMMY_PASSWORD_HASH);
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

        // 用更新后的记录生成响应,保证 lastLoginAt 是本次登录时间
        const updatedUser = await userRepository.updateLoginInfo(user.id, ip);
        return finalizeAuth(updatedUser);
    },

    /**
     * 根据 UUID 查询用户（用于 /api/auth/me、requireAuth）
     */
    async getByUuid(uuid: string) {
        return userRepository.findByUuid(uuid);
    },
};

/**
 * 内部辅助:转 SafeUser 并签发 JWT
 */
async function finalizeAuth(user: User): Promise<AuthResult> {
    const token = signToken({
        uid: Number(user.id),
        sub: user.uuid,
        username: user.username,
    });
    return { user: toSafeUser(user), token };
}
