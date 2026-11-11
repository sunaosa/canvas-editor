import styled from "styled-components";

/**
 * 品牌标记：朱砂方章 + 白色笔尖
 * 方章呼应“落款”，笔尖代表画板这一核心动作。
 */
export function LogoMark({
    size = 28,
    background = "#d6451f",
}: {
    size?: number;
    background?: string;
}) {
    return (
        <Mark
            $size={size}
            $bg={background}
            aria-hidden="true"
            viewBox="0 0 32 32"
            fill="none"
        >
            <path
                d="M9.4 24.2l1-4.3L20.9 9.4a2.1 2.1 0 0 1 3 3L13.4 22.9z"
                stroke="#ffffff"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19.6 10.7l2.9 2.9"
                stroke="#ffffff"
                strokeWidth={1.9}
                strokeLinecap="round"
            />
            <path
                d="M9.6 24.2l3.2-3.2"
                stroke="#ffffff"
                strokeWidth={1.9}
                strokeLinecap="round"
            />
        </Mark>
    );
}

const Mark = styled.svg<{ $size: number; $bg: string }>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    flex: none;
    border-radius: 7px;
    background: ${({ $bg }) => $bg};
`;
