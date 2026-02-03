import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const GlobalConfirmationModal = ({ isOpen, config, onConfirm, onCancel }) => {
    if (!isOpen || !config) return null;

    const {
        title = 'Konfirmasi',
        message = 'Apakah Anda yakin?',
        confirmText = 'Ya, Lanjutkan',
        cancelText = 'Batal',
        type = 'warning' // 'warning', 'danger', 'info'
    } = config;

    const typeStyles = {
        warning: {
            icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
            bg: 'bg-amber-50',
            border: 'border-amber-100'
        },
        danger: {
            icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
            button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
            bg: 'bg-red-50',
            border: 'border-red-100'
        },
        info: {
            icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
            button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        }
    };

    const style = typeStyles[type] || typeStyles.warning;

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header Decoration */}
                <div className={`${style.bg} ${style.border} border-b p-8 flex flex-col items-center text-center gap-4`}>
                    <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
                        {style.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-95 ${style.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default GlobalConfirmationModal;
