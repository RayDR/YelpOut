import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, PrivacyNotice, Footer, ToastProvider } from "@/shared";

export const metadata: Metadata = {
  title: "YelpOut - Planificador Conversacional",
  description: "Planea tus salidas y celebraciones de forma conversacional con YelpOut",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <div className="flex-1">{children}</div>
            <Footer />
            <PrivacyNotice />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
