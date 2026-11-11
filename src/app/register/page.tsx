"use client";

import { Form as AntdForm, App } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { type AuthUser, useAuthStore } from "@/store/auth-store";

interface RegisterValues {
    username: string;
    email?: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: RegisterValues) => {
        if (values.password !== values.confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await api.post<{ user: AuthUser }>(
                "/api/auth/register",
                {
                    username: values.username,
                    email: values.email || undefined,
                    password: values.password,
                    displayName: values.displayName || undefined,
                },
            );
            setUser(data.user);
            message.success("注册成功，正在进入工作台");
            router.push("/chat");
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "注册失败";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="创建账户"
            description="注册后即可保存画稿，并与 AI 助手讨论构图。"
            footer={
                <FooterLine>
                    已经有账户了？
                    <FooterLink href="/login">
                        去登录
                        <ArrowIcon size={15} />
                    </FooterLink>
                </FooterLine>
            }
        >
            <AntdForm
                name="register"
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
                    <FieldLabel htmlFor="register-username">用户名</FieldLabel>
                    <TextField
                        id="register-username"
                        name="username"
                        placeholder="字母、数字、下划线或短横线"
                        autoFocus
                        autoComplete="username"
                    />
                </FormItem>

                <FormItem>
                    <FieldLabel htmlFor="register-displayName">
                        昵称（可选）
                    </FieldLabel>
                    <TextField
                        id="register-displayName"
                        name="displayName"
                        placeholder="展示在顶栏的名字"
                        autoComplete="nickname"
                    />
                </FormItem>

                <FormItem>
                    <FieldLabel htmlFor="register-email">
                        邮箱（可选）
                    </FieldLabel>
                    <TextField
                        id="register-email"
                        name="email"
                        placeholder="example@mail.com"
                        autoComplete="email"
                    />
                </FormItem>

                <FormItem>
                    <FieldLabel htmlFor="register-password">密码</FieldLabel>
                    <PasswordField
                        id="register-password"
                        name="password"
                        placeholder="至少 6 位"
                        autoComplete="new-password"
                    />
                </FormItem>

                <FormItem>
                    <FieldLabel htmlFor="register-confirmPassword">
                        确认密码
                    </FieldLabel>
                    <PasswordField
                        id="register-confirmPassword"
                        name="confirmPassword"
                        placeholder="再输入一次密码"
                        autoComplete="new-password"
                    />
                </FormItem>

                <SubmitItem>
                    <PrimaryButton
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        {loading ? "创建中…" : "创建账户"}
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
        margin-bottom: 16px;
    }
`;

const SubmitItem = styled(AntdForm.Item)`
    && {
        margin-bottom: 0;
        margin-top: 24px;
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
