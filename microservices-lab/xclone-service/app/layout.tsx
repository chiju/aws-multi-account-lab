"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import SessionWrapper from "../components/providers/SessionWrapper";
import { FollowProvider } from "../contexts/FollowContext";
import AuthGuard from "../components/auth/AuthGuard";
import LeftBar from "../components/layouts/LeftBar";
import RightBar from "../components/layouts/RightBar";
import LoginModal from "../components/model/LoginModal";
import RegisterModal from "../components/model/RegisterModal";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#000000',
                color: '#ffffff',
                border: '1px solid #525252',
              },
            }}
          />
          <RegisterModal />
          <LoginModal />
          <FollowProvider>
            <AppLayout>{children}</AppLayout>
          </FollowProvider>
        </SessionWrapper>  
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Premium page should render without main layout
  if (pathname === '/premium_sign_up') {
    return <AuthGuard>{children}</AuthGuard>;
  }
  
  // All other pages use the main layout
  return (
    <AuthGuard>
      <div className="max-w-3xl lg:max-w-screen-5xl xl:max-w-screen-7xl mx-auto flex justify-between">
        <div className="px-2 sm:px-2 2xl:px-8">
          <LeftBar />
        </div>

        <div className="flex-1 lg:min-w-[600px] border-x border-x-neutral-800">
          {children}
        </div>

        <div className="hidden lg:flex ml-4 md:ml-8 flex-1">
          <RightBar />
        </div>
      </div>
    </AuthGuard>
  );
}
