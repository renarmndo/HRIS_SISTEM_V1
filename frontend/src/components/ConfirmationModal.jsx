import { AlertTriangle, CheckCircle, X } from "lucide-react";

// Reusable ConfirmationModal — task 5.1
// type: "warning" | "danger" | "success"
// Accessibility (task 5.6): role="alertdialog", aria-modal, aria-labelledby,
// aria-describedby, focus management, ESC to close.
const TYPE_STYLES = {
  warning: {
    Icon: AlertTriangle,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  danger: {
    Icon: AlertTriangle,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  success: {
    Icon: CheckCircle,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "warning",
  loading = false,
}) {
  if (!isOpen) return null;

  const style = TYPE_STYLES[type] || TYPE_STYLES.warning;
  const Icon = style.Icon;
  const titleId = `confirm-title-${title?.replace(/\s/g, "-") || "x"}`;
  const msgId = `confirm-msg-${title?.replace(/\s/g, "-") || "x"}`;

  // ESC key to close
  function handleKeyDown(e) {
    if (e.key === "Escape" && !loading) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={msgId}
      onKeyDown={handleKeyDown}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-10">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full ${style.bgColor} ${style.borderColor} border-2 flex items-center justify-center flex-shrink-0`}
              aria-hidden="true"
            >
              <Icon className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 id={titleId} className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p id={msgId} className="text-gray-600 mb-6 ml-16">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              autoFocus
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${style.buttonColor}`}
            >
              {loading && (
                <div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                ></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
