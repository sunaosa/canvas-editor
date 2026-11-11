import { Button, Input } from "antd";
import styled from "styled-components";

/**
 * 通用控件：统一圆角（6px）、描边与焦点反馈
 * 颜色一律取自 styled-components 主题（design tokens），不再逐处传参。
 */

/** 图标按钮：用于工具栏与顶栏 */
export const IconButton = styled.button.attrs({ type: "button" })<{
    $size?: number;
    $tone?: "ghost" | "solid" | "accent";
    $disabled?: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${({ $size = 34 }) => $size}px;
    height: ${({ $size = 34 }) => $size}px;
    flex: none;
    border-radius: 6px;
    border: 1px solid
        ${({ $tone, theme }) =>
            $tone === "solid" ? theme.colors.rule : "transparent"};
    background: ${({ $tone, theme }) =>
        $tone === "accent"
            ? theme.colors.accent
            : $tone === "solid"
              ? theme.colors.sheet
              : "transparent"};
    color: ${({ $tone, theme }) =>
        $tone === "accent" ? "#ffffff" : theme.colors.ink};
    cursor: pointer;
    transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;

    &:hover:not(:disabled) {
        background: ${({ $tone, theme }) =>
            $tone === "accent"
                ? theme.colors.accentInk
                : $tone === "solid"
                  ? theme.colors.board
                  : `color-mix(in srgb, ${theme.colors.ink} 7%, transparent)`};
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
`;

/** 主操作按钮 */
export const PrimaryButton = styled(Button)`
    && {
        height: 44px;
        border-radius: 6px;
        font-weight: 600;
        letter-spacing: 0.02em;
        box-shadow: none;
    }
`;

/** 次级按钮（描边） */
export const QuietButton = styled(Button)`
    && {
        height: 38px;
        border-radius: 6px;
        font-weight: 500;
        background: transparent;
    }
`;

/** 表单标签 */
export const FieldLabel = styled.label`
    display: block;
    margin-bottom: 6px;
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

/** 输入框 */
export const TextField = styled(Input)`
    && {
        height: 44px;
        border-radius: 6px;
        background: ${({ theme }) => theme.colors.sheet};
        border-color: ${({ theme }) => theme.colors.rule};
        color: ${({ theme }) => theme.colors.ink};
        box-shadow: none;
    }

    &&:hover {
        border-color: ${({ theme }) => theme.colors.inkSoft};
    }

    &&:focus,
    &&:focus-within {
        border-color: ${({ theme }) => theme.colors.accent};
        box-shadow: 0 0 0 3px
            color-mix(in srgb, ${({ theme }) => theme.colors.accent} 16%, transparent);
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.inkSoft};
        opacity: 0.75;
    }
`;

/** 密码输入框（自带可见性切换） */
export const PasswordField = styled(Input.Password)`
    && {
        height: 44px;
        border-radius: 6px;
        background: ${({ theme }) => theme.colors.sheet};
        border-color: ${({ theme }) => theme.colors.rule};
        color: ${({ theme }) => theme.colors.ink};
        box-shadow: none;
    }

    &&:hover {
        border-color: ${({ theme }) => theme.colors.inkSoft};
    }

    &&:focus,
    &&:focus-within {
        border-color: ${({ theme }) => theme.colors.accent};
        box-shadow: 0 0 0 3px
            color-mix(in srgb, ${({ theme }) => theme.colors.accent} 16%, transparent);
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.inkSoft};
        opacity: 0.75;
    }
`;

/** 行内提示条：用于表单错误与说明 */
export const Notice = styled.div<{ $tone?: "error" | "info" }>`
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    border-left: 3px solid
        ${({ $tone, theme }) =>
            $tone === "error" ? theme.colors.accent : theme.colors.rule};
    background: ${({ $tone, theme }) =>
        $tone === "error" ? theme.colors.accentSoft : theme.colors.sheet};
    color: ${({ $tone, theme }) =>
        $tone === "error" ? theme.colors.accentInk : theme.colors.inkSoft};
`;

/** 分隔细线 */
export const Rule = styled.div`
    height: 1px;
    background: ${({ theme }) => theme.colors.rule};
    border: 0;
`;
