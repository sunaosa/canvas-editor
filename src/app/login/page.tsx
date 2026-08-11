"use client";

import { useState } from "react";
import styled from "styled-components";
import { Input, Button, Form, Typography } from "antd";
import { useTheme } from "../theme-provider";

const { Text } = Typography;

export default function Login() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        console.log("登录:", values);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <Container style={{ background: theme.colors.gradient }}>
            <LoginBox $darkMode={theme.darkMode} style={{ backgroundColor: theme.colors.card }}>
                <H2 style={{ color: theme.colors.text }}>Canvas Editor</H2>
                <SubText style={{ color: theme.colors.textSecondary }}>
                    登录到您的账户
                </SubText>

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>用户名</Label>}
                        name="username"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input
                            placeholder="请输入用户名"
                            size="large"
                            style={{
                                backgroundColor: theme.colors.backgroundSecondary,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                                borderRadius: 8,
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Label style={{ color: theme.colors.text }}>密码</Label>}
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password
                            placeholder="请输入密码"
                            size="large"
                            style={{
                                backgroundColor: theme.colors.backgroundSecondary,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                                borderRadius: 8,
                            }}
                        />
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
                            {loading ? "登录中..." : "登录"}
                        </Button>
                    </Form.Item>
                </Form>

                <Footer>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        还没有账户？
                    </Text>
                    <Link href="#" style={{ color: theme.colors.primary }}>
                        立即注册
                    </Link>
                </Footer>
            </LoginBox>
        </Container>
    );
}

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
`;

const LoginBox = styled.div<{ $darkMode?: boolean }>`
    width: 100%;
    max-width: 420px;
    padding: 48px;
    border-radius: 16px;
    box-shadow: ${({ $darkMode }) =>
        $darkMode
            ? "0 20px 60px rgba(0, 0, 0, 0.5)"
            : "0 20px 60px rgba(0, 0, 0, 0.2)"};
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const H2 = styled.h2`
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 8px;
    transition: color 0.3s ease;
`;

const SubText = styled.p`
    font-size: 14px;
    display: block;
    text-align: center;
    margin-bottom: 32px;
    transition: color 0.3s ease;
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
`;
