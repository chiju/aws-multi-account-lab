import { create } from 'zustand';

interface ModalStore {
  loginModal: boolean;
  registerModal: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  toggleModals: () => void;
}

const useModal = create<ModalStore>((set, get) => ({
  loginModal: false,
  registerModal: false,
  openLogin: () => set({ loginModal: true, registerModal: false }),
  closeLogin: () => set({ loginModal: false }),
  openRegister: () => set({ registerModal: true, loginModal: false }),
  closeRegister: () => set({ registerModal: false }),
  toggleModals: () => {
    const { loginModal, registerModal } = get();
    if (loginModal) {
      set({ loginModal: false, registerModal: true });
    } else if (registerModal) {
      set({ registerModal: false, loginModal: true });
    }
  }
}));

export default useModal;
