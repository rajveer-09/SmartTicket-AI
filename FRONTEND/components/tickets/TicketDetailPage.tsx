import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, Role } from '../../types';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const DetailItem = ({ label, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{children}</dd>
  </div>
);

const Badge = ({ text, color = 'bg-slate-700 text-slate-300' }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-md ${color}`}>{text}</span>
);

const StatusBadge = ({ status }) => {
  const colors = {
    OPEN: 'bg-blue-500/20 text-blue-300',
    IN_PROGRESS: 'bg-purple-500/20 text-purple-300',
    RESOLVED: 'bg-gray-500/20 text-gray-300',
    CLOSED: 'bg-gray-600/20 text-gray-400',
  };
  return <Badge text={status} color={colors[status]} />;
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return <Badge text="Not Set" />;
  const colors = {
    LOW: 'bg-green-500/20 text-green-300',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300',
    HIGH: 'bg-orange-500/20 text-orange-300',
    URGENT: 'bg-red-500/20 text-red-300',
  };
  return <Badge text={priority} color={colors[priority]} />;
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [moderatorMessage, setModeratorMessage] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [users, setUsers] = useState([]);

  const isAdmin = user?.role === Role.ADMIN;
  const isModerator = user?.role === Role.MODERATOR;

  useEffect(() => {
    if (!id) {
      setError('Invalid ticket ID.');
      setIsLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const fetchedTicket = await api.getTicketById(id);
        setTicket(fetchedTicket);
        setTitle(fetchedTicket.title);
        setDescription(fetchedTicket.description);
        setStatus(fetchedTicket.status);
        setModeratorMessage(fetchedTicket.moderatorMessage || '');
        setAssignedToId(fetchedTicket.assignedTo?._id || null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    if (isAdmin) {
      api.getAllUsers().then(setUsers);
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (!ticket) return;
      let updated = ticket;

      if (isAdmin) {
        updated = await api.updateTicket(ticket._id, {
          title,
          description,
          assignedTo: assignedToId,
        });
      }

      let updatedStatusTicket = updated;
      if (isAdmin || isModerator) {
        updatedStatusTicket = await api.updateTicketStatus(ticket._id, {
          status,
          moderatorMessage,
        });
      }

      setTicket(updatedStatusTicket);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  if (!ticket) return <div className="text-center text-slate-400">Ticket not found.</div>;

  const assignedTo = ticket.assignedTo?.name || 'Unassigned';

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Created on {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        {(isAdmin || isModerator) && <Button onClick={() => setEditMode(true)}>Edit</Button>}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Description</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{ticket.description}</p>

          {ticket.aiNotes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-2">AI Generated Notes</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-slate-300">
                {ticket.aiNotes}
              </div>
            </div>
          )}

          {ticket.helpfulNotes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-2">Helpful Notes</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-slate-300">
                {ticket.helpfulNotes}
              </div>
            </div>
          )}

          {ticket.moderatorMessage && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-2">Message from Moderator</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-slate-300">
                {ticket.moderatorMessage}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Details</h2>
          <DetailItem label="Status"><StatusBadge status={ticket.status} /></DetailItem>
          <DetailItem label="Priority"><PriorityBadge priority={ticket.priority} /></DetailItem>
          <DetailItem label="Assigned To"><Badge text={assignedTo} /></DetailItem>
          <DetailItem label="Required Skills">
            {ticket.relatedSkills?.length ? (
              <div className="flex flex-wrap gap-2">
                {ticket.relatedSkills.map(skill => (
                  <Badge key={skill} text={skill} />
                ))}
              </div>
            ) : <Badge text="Not specified" />}
          </DetailItem>
        </div>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-slate-800 p-6 rounded-lg space-y-4 w-full max-w-md">
            <h2 className="text-xl font-bold text-white">Edit Ticket</h2>

            {isAdmin && (
              <>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded bg-slate-700 text-white"
                  placeholder="Title"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded bg-slate-700 text-white"
                  placeholder="Description"
                />
                <select
                  value={assignedToId || ''}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full p-2 rounded bg-slate-700 text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </>
            )}

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <textarea
              value={moderatorMessage}
              onChange={(e) => setModeratorMessage(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white"
              placeholder="Message from Moderator"
            />

            <div className="flex space-x-2">
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
