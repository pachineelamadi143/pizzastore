import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './modal.css';

export default function Modal({ children, onClose }){
  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const el = (
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;
  return ReactDOM.createPortal(el, modalRoot);
}
