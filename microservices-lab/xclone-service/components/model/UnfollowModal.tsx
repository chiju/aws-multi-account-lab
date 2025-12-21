"use client";

import { useCallback } from "react";
import Modal from "../ui/Modal";
import IconButton from "../ui/IconButton";

interface UnfollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
}

const UnfollowModal = ({ isOpen, onClose, onConfirm, username }: UnfollowModalProps) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-8 max-w-sm w-full mx-4">
      <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Unfollow @{username}?</h3>
          <p className="text-neutral-400 text-sm mb-6">
            Their posts will no longer show up in your For You timeline. You can still view their profile, unless their posts are protected.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <IconButton
            onClick={handleConfirm}
            fullWidth
            className="bg-white hover:bg-neutral-200! text-black font-semibold py-3 transition-colors"
          >
            Unfollow
          </IconButton>
          <IconButton
            onClick={onClose}
            variant="outline"
            fullWidth
            className="py-3"
          >
            Cancel
          </IconButton>
        </div>
    </Modal>
  );
};

export default UnfollowModal;
