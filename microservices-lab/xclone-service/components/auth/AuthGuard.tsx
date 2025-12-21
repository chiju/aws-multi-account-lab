"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import IconButton from "../ui/IconButton";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const { openLogin, openRegister } = useModal();
  const hasTriggeredModal = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      hasTriggeredModal.current = false;
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Left: Logo */}
        <div className="w-1/2 flex justify-center items-center">
          <Image
            src="/icons/logo_2.png"
            alt="X Logo"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
        
        {/* Right: Auth Card */}
        <div className="w-1/2 flex flex-col justify-center items-start px-8">
          <h1 className="text-7xl font-bold text-white mb-15">Happening now</h1>
          <p className="text-3xl font-semibold text-white mb-8">Join today.</p>
          
          <button 
            onClick={() => openRegister()}
            className="mb-4 w-80 rounded-full bg-white border border-neutral-600 text-black py-3 font-semibold hover:bg-neutral-200 transition-colors"
          >
            Create account
          </button>
          
          <p className="text-xs text-neutral-400 mt-2 mb-6 w-80 leading-relaxed">
            By signing up, you agree to the{" "}
            <a href="#" className="text-sky-500 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-sky-500 hover:underline">Privacy Policy</a>, including{" "}
            <a href="#" className="text-sky-500 hover:underline">Cookie Use</a>.
          </p>
          
          <div className="mt-4 w-80">
            <p className="text-white font-semibold mb-4 text-lg">Already have an account?</p>
            <IconButton 
              onClick={() => openLogin()}
              variant="outline"
              fullWidth
              className="mb-3 py-3"
            >
              Sign in
            </IconButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
