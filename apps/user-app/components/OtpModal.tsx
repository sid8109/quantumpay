"use client"

import { IoCloseSharp } from "react-icons/io5";


interface OtpModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

export const OtpModal = ({ onClose, children }: OtpModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 relative">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Enter OTP</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                        <IoCloseSharp size={28} />
                    </button>
                </div>
                <div className="mt-4 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};