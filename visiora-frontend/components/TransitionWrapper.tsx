"use client";

import { Suspense } from "react";
import { TransitionProvider } from "./TransitionProvider";

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <TransitionProvider>
                {children}
            </TransitionProvider>
        </Suspense>
    );
}
