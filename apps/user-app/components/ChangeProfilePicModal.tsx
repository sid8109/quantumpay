import { IoCloseSharp } from "react-icons/io5";

const ChangeProfilePicModal = ({ closeModal } : { closeModal: any }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Change Profile Picture</h2>
            <button onClick={closeModal} className="text-gray-600 hover:text-gray-900"><IoCloseSharp size={28} /></button>
          </div>
          <p className="text-gray-600 mt-5">Select a new profile picture.</p>
          <form className="mt-3">
            <div className="mb-4">
              <input type="file" className="w-full p-2 border rounded" />
            </div>
            <button type="submit" className="w-full bg-teal-400 text-white py-2 rounded">Save Changes</button>
          </form>
        </div>
      </div>
    );
  };
  
  export default ChangeProfilePicModal;
  