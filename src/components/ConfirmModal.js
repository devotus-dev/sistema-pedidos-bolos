import React from "react";

export default function ConfirmModal({ open, onClose, onConfirm, mensagem }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <div className="mb-4 text-center">
          <p className="text-lg text-gray-700">{mensagem || "Tem certeza?"}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
