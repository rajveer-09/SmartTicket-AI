
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Priority, TicketStatus } from '../../types';

interface TicketCardProps {
  ticket: Ticket;
}

const PriorityBadge: React.FC<{ priority?: Priority }> = ({ priority }) => {
  if (!priority) return null;
  const colors = {
    [Priority.LOW]: 'bg-green-500/20 text-green-300',
    [Priority.MEDIUM]: 'bg-yellow-500/20 text-yellow-300',
    [Priority.HIGH]: 'bg-orange-500/20 text-orange-300',
    [Priority.URGENT]: 'bg-red-500/20 text-red-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
};

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const colors = {
        [TicketStatus.OPEN]: 'bg-blue-500/20 text-blue-300',
        [TicketStatus.IN_PROGRESS]: 'bg-purple-500/20 text-purple-300',
        [TicketStatus.RESOLVED]: 'bg-gray-500/20 text-gray-300',
        [TicketStatus.CLOSED]: 'bg-gray-600/20 text-gray-400',
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <Link to={`/tickets/${ticket._id}`} className="block">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 h-full flex flex-col justify-between hover:bg-slate-700/50 transition-all duration-300 border border-slate-700 hover:border-sky-500">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white pr-4">{ticket.title}</h3>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{ticket.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-slate-500">
                {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;
