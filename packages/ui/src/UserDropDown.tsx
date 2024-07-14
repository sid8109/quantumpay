import { useState } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from "next/navigation";

const UserDropdown = ({ onSignout } : {
    onSignout: any
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center items-center w-full rounded-full text-sm font-medium text-gray-700 focus:outline-none"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={toggleDropdown}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <div
                            className="text-gray-700 block px-4 py-2 text-sm flex items-center border-b border-gray-200 cursor-pointer"
                            role="menuitem"
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/profile")
                            }}
                        >
                            <FaUser className="mr-3" />
                            Profile
                        </div>
                        <div
                            className="text-red-600 block px-4 py-2 text-sm flex items-center cursor-pointer"
                            role="menuitem"
                            onClick={onSignout}
                        >
                            <FaSignOutAlt className="mr-3" />
                            Logout
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
