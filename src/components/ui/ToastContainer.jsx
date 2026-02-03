import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const Toast = ({ id, type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const styles = {
        success: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            text: 'text-emerald-800'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            text: 'text-red-800'
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
            text: 'text-amber-800'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: <Info className="w-5 h-5 text-blue-500" />,
            text: 'text-blue-800'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${style.bg} ${style.border} shadow-lg animate-fade-in-right max-w-md pointer-events-auto`}>
            <div className="flex-shrink-0">{style.icon}</div>
            <div className={`flex-1 text-sm font-semibold ${style.text}`}>{message}</div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
