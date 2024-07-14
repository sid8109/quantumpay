import { useRef, useState } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { changePassword } from '../app/lib/actions/passwordHandler';
import { toast } from 'sonner';

const ChangePasswordModal = ({ id, closeModal }: { id: string | undefined; closeModal: any; }) => {
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = currentPasswordRef.current?.value;
    const newPassword = newPasswordRef.current?.value;
    if (!currentPassword || !newPassword) {
      setError('Please fill in both fields.');
      return;
    }
    const response = await changePassword(id, currentPassword, newPassword);
    if(response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.message);
    }
    setError('');
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Change Password</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
            <IoCloseSharp size={28} />
          </button>
        </div>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
            <input
              type="password"
              ref={currentPasswordRef}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <input
              type="password"
              ref={newPasswordRef}
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-teal-400 text-white py-2 rounded"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
