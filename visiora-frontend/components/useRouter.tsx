"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { usePageTransition } from "./TransitionProvider";
import { useCallback, useMemo } from "react";

/**
 * Enhanced useRouter hook that triggers page transition loader
 * for programmatic navigation (router.push, router.replace)
 */
export function useRouter() {
    const router = useNextRouter();
    const { startTransition } = usePageTransition();

    const push = useCallback((href: string, options?: Parameters<typeof router.push>[1]) => {
        // Only start transition if navigating to a different route
        if (window.location.pathname + window.location.search !== href) {
            startTransition();
        }
        return router.push(href, options);
    }, [router, startTransition]);

    const replace = useCallback((href: string, options?: Parameters<typeof router.replace>[1]) => {
        // Only start transition if navigating to a different route
        if (window.location.pathname + window.location.search !== href) {
            startTransition();
        }
        return router.replace(href, options);
    }, [router, startTransition]);

    return useMemo(() => ({
        ...router,
        push,
        replace,
    }), [router, push, replace]);
}
