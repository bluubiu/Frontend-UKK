import React, { useState, useCallback } from 'react';
import NotificationContext from './NotificationContext';
import ToastContainer from '../components/ui/ToastContainer';
import GlobalConfirmationModal from '../components/ui/GlobalConfirmationModal';

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const confirm = useCallback((config) => {
        return new Promise((resolve) => {
            setConfirmConfig(config);
            setConfirmCallback(() => (result) => {
                setConfirmConfig(null);
                setConfirmCallback(null);
                resolve(result);
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmCallback) confirmCallback(true);
    };

    const handleCancel = () => {
        if (confirmCallback) confirmCallback(false);
    };

    return (
        <NotificationContext.Provider value={{ showToast, confirm }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <GlobalConfirmationModal
                isOpen={!!confirmConfig}
                config={confirmConfig}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </NotificationContext.Provider>
    );
};
