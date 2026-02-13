import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'max-w-md';
            case 'md': return 'max-w-lg';
            case 'lg': return 'max-w-2xl';
            case 'xl': return 'max-w-4xl';
            case '2xl': return 'max-w-6xl';
            case 'full': return 'max-w-full m-4';
            default: return 'max-w-lg';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className={`w-full bg-white rounded-xl shadow-xl overflow-hidden ${getSizeClasses()}`}
                                ref={modalRef}
                            >
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">{children}</div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
