"use client";

import { Form as AntdForm, App, Spin } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import styled from "styled-components";
import { AuthShell } from "@/components/auth-shell";
import { ArrowIcon } from "@/components/icons";
import {
    FieldLabel,
    Notice,
    PasswordField,
    PrimaryButton,
    TextField,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { safeRedirect } from "@/lib/redirect";
import { type AuthUser, useAuthStore } from "@/store/auth-store";

interface LoginValues {
    username: string;
    password: string;
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: LoginValues) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.post<{ user: AuthUser }>(
                "/api/auth/login",
                values,
            );
            setUser(data.user);
            message.success("登录成功");
            // 只允许站内路径,防止 ?redirect=https://evil.com 型开放重定向
            router.push(safeRedirect(searchParams.get("redirect")));
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "登录失败";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="登录"
            description="使用用户名或邮箱继续，进画板后可直接落笔。"
            footer={
                <FooterLine>
                    还没有账户？
                    <FooterLink href="/register">
                        创建一个
                        <ArrowIcon size={15} />
                    </FooterLink>
                </FooterLine>
            }
        >
            <AntdForm
                name="login"
                onFinish={onFinish}
                layout="vertical"
                autoComplete="off"
                requiredMark={false}
                onValuesChange={() => setError(null)}
            >
                {error ? (
                    <ErrorSlot>
                        <Notice $tone="error" role="alert">
                            {error}
                        </Notice>
                    </ErrorSlot>
                ) : null}

                <FormItem>
                    <FieldLabel htmlFor="login-username">
                        用户名或邮箱
                    </FieldLabel>
                    <TextField
                        id="login-username"
                        name="username"
                        placeholder="请输入用户名或邮箱"
                        autoFocus
                        autoComplete="username"
                    />
                </FormItem>

                <FormItem>
                    <FieldLabel htmlFor="login-password">密码</FieldLabel>
                    <PasswordField
                        id="login-password"
                        name="password"
                        placeholder="请输入密码"
                        autoComplete="current-password"
                    />
                </FormItem>

                <SubmitItem>
                    <PrimaryButton
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        {loading ? "登录中…" : "登录"}
                    </PrimaryButton>
                </SubmitItem>
            </AntdForm>
        </AuthShell>
    );
}

const ErrorSlot = styled.div`
    margin-bottom: 16px;
`;

const FormItem = styled(AntdForm.Item)`
    && {
        margin-bottom: 18px;
    }
`;

const SubmitItem = styled(AntdForm.Item)`
    && {
        margin-bottom: 0;
        margin-top: 26px;
    }
`;

const FooterLine = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
`;

const FooterLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const LoadingFallback = () => (
    <Centered>
        <Spin size="large" />
    </Centered>
);

const Centered = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
`;
