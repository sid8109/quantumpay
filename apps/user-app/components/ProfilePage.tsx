"use client"

import { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import ChangeProfilePicModal from './ChangeProfilePicModal';
import { sessionState } from '@repo/store/session';
import { useRecoilValue } from 'recoil';

const Profile = () => {
  const session = useRecoilValue(sessionState);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isProfilePicModalOpen, setProfilePicModalOpen] = useState(false);

  return (
    <div className='max-w-3xl m-auto bg-white rounded-lg mt-3'>
      <div className="flex">
        <div className="w-1/2 bg-teal-400 p-9 rounded-l-lg flex flex-col justify-center items-center">
          <div
            className="relative cursor-pointer"
            onClick={() => setProfilePicModalOpen(true)}
          >
            {session?.user.profilePic ? (
              <img
                src={session.user.profilePic}
                alt="User"
                className="w-24 h-24 rounded-full object-cover border-4 shadow-lg border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white border-4 border-teal-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-22">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">{session?.user.name}</h2>
          <p className="text-white">{session?.user.email}</p>
        </div>
        <div className="w-1/2 p-9">
          <div className="mb-4">
            <label className="block text-gray-700 text-xl font-bold mb-2">Phone</label>
            <p className="text-gray-900">{session?.user.number}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-xl font-bold mb-2">Account Balance</label>
            <p className="text-gray-900">₹{session?.user.balance}</p>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-teal-400 text-white rounded shadow"
            onClick={() => setPasswordModalOpen(true)}
          >
            Change Password
          </button>
        </div>
      </div>
      {isPasswordModalOpen && <ChangePasswordModal id={session?.user.id} closeModal={() => setPasswordModalOpen(false)} />}
      {isProfilePicModalOpen && <ChangeProfilePicModal closeModal={() => setProfilePicModalOpen(false)} />}
    </div>
  );
};

export default Profile;
