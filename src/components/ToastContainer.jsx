// Toast Container for managing multiple toasts
import { useState, useCallback } from "react";
import Toast from "./Toast";
import { createContext, useContext } from "react";

const ToastContext = createContext({
    showToast: () => { },
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 left-1/2 z-50 pointer-events-none">
                <div className="flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                message={toast.message}
                                type={toast.type}
                                onClose={() => removeToast(toast.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

