import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function NotificationsContainer() {
    return <ToastContainer position="bottom-center" autoClose={3500} />;
}

export const notify = Object.freeze({
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
});
