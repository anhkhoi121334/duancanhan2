import React from 'react';
import { useCartStore } from '../store/cartStore';
import Toast from './Toast';

const ToastContainer = () => {
  const { toast, hideToast } = useCartStore();

  if (!toast) return null;

  return (
    <Toast 
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  );
};

export default ToastContainer;

