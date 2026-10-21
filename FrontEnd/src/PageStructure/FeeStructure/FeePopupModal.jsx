// =====================================================
// FEE POPUP MODAL (SUCCESS & FAILURE)
// =====================================================

import { useEffect } from "react";
import "./FeePopupModal.css";

const FeePopupModal = ({
  show,
  type = "success", // "success" | "error"
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 4000,
}) => {
  useEffect(() => {
    if (!show || !autoClose || type === "error") return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [show, autoClose, autoCloseDuration, type, onClose]);

  if (!show) return null;

  return (
    <div className="fee-popup-backdrop" onClick={onClose}>
      <div
        className={`fee-popup-card fee-popup-${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="fee-popup-close-x"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="fee-popup-icon-wrapper">
          {type === "success" ? (
            <div className="fee-popup-icon success">✓</div>
          ) : (
            <div className="fee-popup-icon error">✕</div>
          )}
        </div>

        <h3 className="fee-popup-title">
          {title || (type === "success" ? "Success!" : "Operation Failed")}
        </h3>

        <p className="fee-popup-message">{message}</p>

        <div className="fee-popup-actions">
          <button
            type="button"
            className={`fee-popup-btn ${
              type === "success"
                ? "fee-popup-btn-success"
                : "fee-popup-btn-error"
            }`}
            onClick={onClose}
          >
            {type === "success" ? "OK" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeePopupModal;
