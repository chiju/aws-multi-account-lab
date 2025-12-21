"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import Input from "../ui/Input";
import useModal from "@/hooks/useModal";
import Modal from "./AuthModal";

const LoginModal = () => {
  const { loginModal, closeLogin, toggleModals } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onToggle = useCallback(() => {
    if (isLoading) return;
    toggleModals();
  }, [isLoading, toggleModals]);

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Validation
      if (!email || !password) {
        toast.error('Email and password are required!');
        return;
      }
      
      if (!email.includes('@')) {
        toast.error('Please enter a valid email!');
        return;
      }
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials!');
      } else {
        toast.success('Logged in successfully.');
        closeLogin();
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, closeLogin]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        disabled={isLoading}
      />
      <Input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        disabled={isLoading}
      />
    </div>
  );

  const footerContent = (
    <div className="text-neutral-400 text-start mt-4">
      <p>
        Don&apos;t have an account ?
        <span
        onClick={onToggle}
          className="
        text-sky-500
        cursor-pointer
        hover:underline
      "
        > Sign up
        </span>
      </p>
    </div>
  );

  return (
    <div>
      <Modal
      disabled={isLoading}
        isOpen={loginModal}
        title="Sign in to x"
        actionLabel="Sign in"
        onClose={closeLogin}
        onSubmit={onSubmit}
        body={bodyContent}
        footer={footerContent}
      />
    </div>
  );
};

export default LoginModal;
