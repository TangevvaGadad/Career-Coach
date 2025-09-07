import type { Metadata } from "next";
import {
  ClerkProvider,

} from '@clerk/nextjs'
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { dark } from '@clerk/themes'


const inter=Inter({subsets:["latin"]});
export const metadata: Metadata = {
  title: "PrepGenius-AI career coach",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme:dark,
    }}>
          <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.className} `}
      >
        <ThemeProvider
          attribute="class" // Applies class to <html>
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header/>            
          <main className="min-h-screen">{children}</main>
          <footer className="bg-muted/50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-200">
              <p>Made by Team prepgenius</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>

    </ClerkProvider>


  );
}
