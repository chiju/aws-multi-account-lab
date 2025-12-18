import { useState } from 'react';

interface UnfollowModalState {
  isOpen: boolean;
  userId: string;
  username: string;
}

export function useUnfollowModal() {
  const [modal, setModal] = useState<UnfollowModalState>({
    isOpen: false,
    userId: '',
    username: ''
  });

  const openModal = (userId: string, username: string) => {
    setModal({ isOpen: true, userId, username });
  };

  const closeModal = () => {
    setModal({ isOpen: false, userId: '', username: '' });
  };

  return {
    modal,
    openModal,
    closeModal
  };
}
