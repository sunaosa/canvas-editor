"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/**
 * styled-components 的 SSR 注册器
 * 作用：把 styled-components 在服务端生成的样式注入到 HTML 中，
 * 避免客户端 hydrate 时 className 不匹配
 */
export default function StyledComponentsRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    // 只创建一次 ServerStyleSheet
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    // 客户端直接渲染 children（不需要 StyleSheetManager）
    if (typeof window !== "undefined") return <>{children}</>;

    // 服务端：把样式收集到 ServerStyleSheet 里
    return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
            {children}
        </StyleSheetManager>
    );
}
