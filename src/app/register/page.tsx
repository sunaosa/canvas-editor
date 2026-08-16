"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { App, Input, Button, Form, Typography } from "antd";
import { useTheme } from "../theme-provider";
import { api, ApiError } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/auth-store";

const { Text } = Typography;

interface RegisterValues {
    username: string;
    email?: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const setUser = useAuthStore((s) => s.setUser);
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: RegisterValues) => {
        if (values.password !== values.confirmPassword) {
            message.error("两次输入的密码不一致");
            return;
        }

        setLoading(true);
        try {
            const data = await api.post<{ user: AuthUser; token: string }>(
                "/api/auth/register",
                {
                    username: values.username,
                    email: values.email || undefined,
                    password: values.password,
                    displayName: values.displayName || undefined,
                }
            );
            setUser(data.user);
            message.success("注册成功，正在跳转...");
            router.push("/chat");
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "注册失败";
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container style={{ background: theme.colors.gradient }}>
            <RegisterBox
                $darkMode={theme.darkMode}
                style={{ backgroundColor: theme.colors.card }}
            >
                <H2 style={{ color: theme.colors.text }}>Canvas Editor</H2>
                <SubText style={{ color: theme.colors.textSecondary }}>
                    创建新账户
                </SubText>

                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>用户名</Label>}
                        name="username"
                        rules={[
                            { required: true, message: "请输入用户名" },
                            { min: 3, max: 50, message: "用户名长度 3-50 字符" },
                        ]}
                    >
                        <Input placeholder="字母/数字/下划线/短横线" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>邮箱（可选）</Label>}
                        name="email"
                        rules={[{ type: "email", message: "邮箱格式不正确" }]}
                    >
                        <Input placeholder="example@mail.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>昵称（可选）</Label>}
                        name="displayName"
                    >
                        <Input placeholder="显示名称" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>密码</Label>}
                        name="password"
                        rules={[
                            { required: true, message: "请输入密码" },
                            { min: 6, max: 100, message: "密码长度 6-100 字符" },
                        ]}
                    >
                        <Input.Password placeholder="至少 6 位" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>确认密码</Label>}
                        name="confirmPassword"
                        rules={[
                            { required: true, message: "请再次输入密码" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("两次密码不一致"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="再次输入密码" size="large" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{ borderRadius: 8 }}
                        >
                            {loading ? "注册中..." : "注册"}
                        </Button>
                    </Form.Item>
                </Form>

                <Footer>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        已有账户？
                    </Text>
                    <Link href="/login" style={{ color: theme.colors.primary }}>
                        立即登录
                    </Link>
                </Footer>
            </RegisterBox>
        </Container>
    );
}

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
`;

const RegisterBox = styled.div<{ $darkMode?: boolean }>`
    width: 100%;
    max-width: 460px;
    padding: 48px;
    border-radius: 16px;
    box-shadow: ${({ $darkMode }) =>
        $darkMode
            ? "0 20px 60px rgba(0, 0, 0, 0.5)"
            : "0 20px 60px rgba(0, 0, 0, 0.2)"};
`;

const H2 = styled.h2`
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 8px;
`;

const SubText = styled.p`
    font-size: 14px;
    text-align: center;
    margin-bottom: 32px;
`;

const Label = styled.span``;

const Footer = styled.div`
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
`;

const Link = styled.a`
    margin-left: 4px;
    font-weight: 500;
    text-decoration: none;
    &:hover { text-decoration: underline; }
`;
