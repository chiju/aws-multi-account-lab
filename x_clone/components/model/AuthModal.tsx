import React, { useCallback } from "react";
import { AiOutlineClose } from "react-icons/ai"; 
import Image from "next/image";
import Button from "../ui/Button";



interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel: string;
  disabled?: boolean;
  secondary?: boolean; // Add secondary prop for the button
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondary, // Ensure this is passed to Button
}) => {
  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }
    onClose();
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }
    onSubmit();
  }, [disabled, onSubmit]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        justify-center
        items-center
        flex
        overflow-x-hidden
        overflow-y-auto
        fixed
        inset-0
        z-50
        outline-none
        focus:outline-none
        bg-black
        bg-opacity-70
      "
    >
      <div
        className="
          relative
          w-full
          sm:w-5/6
          md:w-4/6
          lg:w-3/6
          xl:w-2/6
          my-6
          mx-auto
          max-w-lg
          h-full
          sm:h-auto
        "
      >
        <div
          className="
            h-full
            sm:h-auto
            border
            border-neutral-800
            rounded-lg
            shadow-lg
            relative
            flex
            flex-col
            w-full
            bg-black
            outline-none
            focus:outline-none
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-center
              p-4
              sm:p-6
              md:p-8
              rounded-t
              relative
            "
          >
            <button
              onClick={handleClose}
              className="
                absolute
                left-4
                sm:left-6
                md:left-8
                p-2
                rounded-full
                hover:bg-neutral-800
                text-white
                transition
              "
            >
              <AiOutlineClose size={20} />
            </button>
            
            <div className="w-8 h-8">
              <Image
                src="/icons/logo_2.png"
                alt="X Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Body */}
          <div className="relative p-4 sm:p-6 md:p-8 flex-auto">
            {title && (
              <h2 className="text-3xl font-bold text-white mb-6 text-left">{title}</h2>
            )}
            {body}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 p-4 sm:p-6 md:p-8">
            <Button
              disabled={disabled}
              label={actionLabel}
              secondary={secondary} // Pass secondary
              fullWidth
              large
              onClick={handleSubmit}
            />
            {/* You may add additional footer elements here */}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
