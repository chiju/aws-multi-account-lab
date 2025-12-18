"use client";

import { useCallback, useState } from "react";
import Input from "../ui/Input";
import useModal from "@/hooks/useModal";
import Modal from "./AuthModal";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

const RegisterModal = () => {
  const { registerModal, closeRegister, toggleModals } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

   const onToggle = useCallback(() => {
    if (isLoading) return;
    toggleModals();
  }, [isLoading, toggleModals]);

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/auth/register',{
        email,
        password,
        username,
        name
      })
      toast.success('Account created successfully.');
      signIn('credentials', {
        email,
        password
      })
      closeRegister();
    } catch (error) {   
      console.log(error);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [closeRegister, email, password, username, name]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        disabled={isLoading}
      />
      <Input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        value={name}
        disabled={isLoading}
      />
      <Input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
        disabled={isLoading}
      />
      <Input
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        disabled={isLoading}
      />
    </div>
  );

  const footerContent = (
    <div className="text-neutral-400 text-start mt-4">
      <p>
        Already have an account ?
        <span
        onClick={onToggle}
          className="
        text-sky-500
        cursor-pointer
        hover:underline
      "
        > Sign in
        </span>
      </p>
    </div>
  );

  return (
    <div>
      <Modal
        disabled={isLoading}
        isOpen={registerModal}
        title="Create an account"
        actionLabel="Register"
        onClose={closeRegister}
        onSubmit={onSubmit}
        body={bodyContent}
        footer={footerContent}
      />
    </div>
  );
};

export default RegisterModal;
