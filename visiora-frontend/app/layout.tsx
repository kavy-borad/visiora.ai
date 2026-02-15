import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import TransitionWrapper from "@/components/TransitionWrapper";
import { Suspense } from "react";
import PageLoader from "@/components/PageLoader";
import AppInitializer from "@/components/AppInitializer";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { WalletProviderWrapper } from "@/components/WalletProviderWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ephotocart - Smart Photo Solutions",
  description: "Upload an image and get professional variations powered by AI",
  icons: {
    icon: '/logo-new.svg', // Fix favicon error by using existing logo
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased h-screen w-screen overflow-hidden bg-background`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <ThemeProvider>
          <AppInitializer>
            <WalletProviderWrapper>
              <SidebarProvider>
                <TransitionWrapper>
                  {/* Fixed App Wrapper */}
                  <div className="h-full w-full flex flex-col overflow-hidden">
                    {children}
                  </div>
                </TransitionWrapper>
              </SidebarProvider>
            </WalletProviderWrapper>
          </AppInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
