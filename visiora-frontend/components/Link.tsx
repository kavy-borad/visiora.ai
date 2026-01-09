"use client";

import NextLink from "next/link";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Enhanced Link component that uses Next.js built-in navigation
 * for smooth, prefetched transitions.
 * 
 * Uses native Next.js Link without intercepting, enabling:
 * - Automatic route prefetching on hover
 * - Optimized client-side navigation
 * - Smooth page transitions via TransitionProvider
 */
export default function Link({ children, href, prefetch = true, ...props }: LinkProps) {
    return (
        <NextLink href={href} prefetch={prefetch} {...props}>
            {children}
        </NextLink>
    );
}
