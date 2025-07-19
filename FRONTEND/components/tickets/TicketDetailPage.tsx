import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, Priority, TicketStatus, User } from '../../types';
import Spinner from '../common/Spinner';

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{children}</dd>
  </div>
);

const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = 'bg-slate-700 text-slate-300' }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-md ${color}`}>{text}</span>
);

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const colors = {
    [TicketStatus.OPEN]: 'bg-blue-500/20 text-blue-300',
    [TicketStatus.IN_PROGRESS]: 'bg-purple-500/20 text-purple-300',
    [TicketStatus.RESOLVED]: 'bg-gray-500/20 text-gray-300',
    [TicketStatus.CLOSED]: 'bg-gray-600/20 text-gray-400',
  };
  return <Badge text={status} color={colors[status]} />;
};

const PriorityBadge: React.FC<{ priority?: Priority }> = ({ priority }) => {
  if (!priority) return <Badge text="Not Set" />;
  const colors = {
    [Priority.LOW]: 'bg-green-500/20 text-green-300',
    [Priority.MEDIUM]: 'bg-yellow-500/20 text-yellow-300',
    [Priority.HIGH]: 'bg-orange-500/20 text-orange-300',
    [Priority.URGENT]: 'bg-red-500/20 text-red-300',
  };
  const capitalized = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  return <Badge text={capitalized} color={colors[priority]} />;
};

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid ticket ID.');
      setIsLoading(false);
      return;
    }

    const fetchTicket = async () => {
      setIsLoading(true);
      try {
        const fetchedTicket = await api.getTicketById(id);
        setTicket(fetchedTicket);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  if (error) return <div className="text-center text-red-400">{error}</div>;

  if (!ticket) return <div className="text-center text-slate-400">Ticket not found.</div>;

  const assignedTo = ticket.assignedTo && typeof ticket.assignedTo === 'object' && 'name' in ticket.assignedTo
    ? (ticket.assignedTo as User).name
    : 'Unassigned';

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ticket created on {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Description</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{ticket.description}</p>

          {ticket.aiNotes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="mr-2"><path d="M12 8V4H8" /><rect x="8" y="12" width="8" height="8" rx="2" /><path d="M8 12v-2a2 2 0 0 1 2-2h4v4" /></svg>
                AI Generated Notes
              </h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300 whitespace-pre-wrap text-sm">{ticket.aiNotes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Details</h2>
          <dl className="divide-y divide-slate-700">
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
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
