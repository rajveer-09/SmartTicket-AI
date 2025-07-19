
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import Spinner from '../common/Spinner';
import UserManagementModal from './UserManagementModal';
import Button from '../common/Button';

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const colors = {
    [Role.USER]: 'bg-gray-500/20 text-gray-300',
    [Role.MODERATOR]: 'bg-blue-500/20 text-blue-300',
    [Role.ADMIN]: 'bg-purple-500/20 text-purple-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${colors[role]}`}>{role}</span>;
};


const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await api.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
    handleModalClose();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  return (
    <>
      <div className="bg-slate-800 shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Skills</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="flex flex-wrap gap-1">
                      {user.skills?.map(skill => <span key={skill} className="px-2 py-0.5 text-xs bg-slate-700 rounded-md">{skill}</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && selectedUser && (
        <UserManagementModal 
            user={selectedUser} 
            onClose={handleModalClose}
            onUpdate={handleUserUpdate}
        />
      )}
    </>
  );
};

export default AdminDashboardPage;
