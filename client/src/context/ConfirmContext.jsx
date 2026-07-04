import { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = (message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  };

  const handleClose = (result) => {
    confirmState.resolve(result);
    setConfirmState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState && (
        <Modal title="Confirm Action" onClose={() => handleClose(false)}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>{confirmState.message}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => handleClose(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleClose(true)}>Confirm</button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider');
  return confirm;
};
