import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../store/authSlice';
import { LogOut, User, Settings, SwitchCamera } from 'lucide-react';
import axios from 'axios';

const UserPanel = ({ closePanel }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navTo = path => {
    navigate(path);
    if (closePanel) closePanel();
  };

  if (!user) return null;

  return (
    <div className="absolute right-0 top-12 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar?.url}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
          />
          <div className="flex-1 overflow-hidden">
            <h3 className="text-white font-semibold truncate">
              {user.fullName}
            </h3>
            <p className="text-gray-400 text-sm truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={() => navTo(`/channel/${user.username}`)}
          className="w-full flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
        >
          <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-gray-700">
            <User size={16} className="text-purple-400" />
          </div>
          Your Channel
        </button>

        <button
          onClick={() => navTo('/settings')}
          className="w-full flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
        >
          <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-gray-700">
            <Settings size={16} className="text-blue-400" />
          </div>
          Settings
        </button>

        <button
          className="w-full flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          title="Feature coming soon"
        >
          <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-gray-700">
            <SwitchCamera size={16} className="text-green-400" />
          </div>
          Switch Account
        </button>

        <div className="h-px bg-gray-700 my-1"></div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
        >
          <div className="p-1.5 bg-red-900/30 rounded-full">
            <LogOut size={16} className="text-red-500" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserPanel;
