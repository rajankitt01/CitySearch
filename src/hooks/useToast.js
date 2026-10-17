import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.js';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
