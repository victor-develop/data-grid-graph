import { PropsWithChildren } from 'react';
import styles from './Modal.module.scss';

const Modal = ({
  children,
  onClose,
  header,
  fullSize = true,
  saveButton,
  cancelButton,
}: PropsWithChildren<{
  onClose: () => void;
  saveButton?: {
    onClick: () => void;
    isDisabled?: boolean;
  };
  cancelButton?: {
    onClick: () => void;
    isDisabled?: boolean;
  };
  header?: JSX.Element | string;
  fullSize?: boolean;
}>) => {
  return (
    <>
      <div className={styles['overlay']} onClick={onClose}></div>
      <div
        className={`${styles['modal']} ${fullSize ? styles['full-size'] : ''}`}
      >
        <div className={styles['close-button']} onClick={onClose}>
          X
        </div>
        <div>
          {header}
          {children}
        </div>
        <div className={styles['bottom']}>
          {cancelButton && (
            <button
              onClick={cancelButton.onClick}
              disabled={cancelButton.isDisabled}
              className={styles['cancel-button']}
            >
              Cancel
            </button>
          )}
          {saveButton && (
            <button
              onClick={saveButton.onClick}
              disabled={saveButton.isDisabled}
              className={styles['save-button']}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
