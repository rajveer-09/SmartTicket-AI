import React, { useState } from 'react';
import { User, Role } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';

interface UserManagementModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, onClose, onUpdate }) => {
  const [role, setRole] = useState<Role>(user.role);
  const [skills, setSkills] = useState<string>(user.skills?.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

      const updatedUser = await api.updateUser({
        email: user.email,      // ✅ Email sent as required by backend
        role: role,
        skills: skillsArray
      });

      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Edit User: {user.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{user.email}</p>

            {error && <div className="p-3 mb-4 bg-red-500/20 text-red-300 rounded-md text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g. javascript, payments, api"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 px-6 py-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;
