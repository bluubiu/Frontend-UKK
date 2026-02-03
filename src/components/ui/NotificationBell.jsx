import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh on open
            fetchNotifications();
        }
    };

    const handleMarkRead = (e, notifId) => {
        e.stopPropagation();
        markAsRead(notifId);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleBellClick}
                className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center group relative"
                title="Notifikasi"
            >
                <Bell className={`h-5 w-5 transition-transform group-hover:rotate-12 ${unreadCount > 0 ? 'text-emerald-500' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm text-[10px] text-white justify-center items-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                        <h3 className="font-bold text-gray-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Bell className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm">Belum ada notifikasi</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors relative group cursor-default ${!notif.read_at ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read_at ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notif.read_at ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 pt-1">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                                </p>
                                            </div>

                                            {!notif.read_at && (
                                                <button
                                                    onClick={(e) => handleMarkRead(e, notif.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-full h-fit flex-shrink-0"
                                                    title="Tandai sudah dibaca"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                        <span className="text-xs text-gray-400">Menampilkan 20 notifikasi terbaru</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
