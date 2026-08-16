import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// JWT Payload 结构
export interface JwtPayload {
    /** 用户自增 ID（内部使用）*/
    uid: number;
    /** 用户 UUID（对外 ID）*/
    sub: string;
    /** 用户名 */
    username: string;
    /** 签发时间 */
    iat?: number;
    /** 过期时间 */
    exp?: number;
}

/**
 * 哈希密码
 */
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

/**
 * 签发 JWT
 */
export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * 验证并解析 JWT
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * 从 Cookie / Header 中提取 Bearer Token
 */
export function extractToken(authHeader: string | null | undefined, cookieToken?: string | null): string | null {
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    if (cookieToken) {
        return cookieToken;
    }
    return null;
}
