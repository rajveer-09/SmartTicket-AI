
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';

const CreateTicketPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.createTicket({ title, description });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create a New Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-md text-sm">{error}</div>}
          <div>
            <Input
              id="title"
              name="title"
              type="text"
              required
              label="Subject"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot reset my password"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="Please provide as much detail as possible..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading} size="lg">
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
