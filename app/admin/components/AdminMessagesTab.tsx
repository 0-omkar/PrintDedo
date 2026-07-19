import { Mail, Trash2 } from 'lucide-react';
import { ActiveView, AdminMessage } from '../types';

interface AdminMessagesTabProps {
  activeView: ActiveView;
  adminMessages: AdminMessage[];
  loadingMessages: boolean;
  onRefreshMessages: () => void;
  onDeleteMessage: (id: string) => void;
}

export const AdminMessagesTab = ({
  activeView,
  adminMessages,
  loadingMessages,
  onRefreshMessages,
  onDeleteMessage,
}: AdminMessagesTabProps) => {
  if (activeView !== 'messages') return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Contact Admin Inbox</h2>
          <p className="text-xs text-slate-500 font-medium">Direct messages submitted by users & shop owners</p>
        </div>

        <button
          onClick={onRefreshMessages}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          {loadingMessages ? 'Loading...' : 'Refresh Inbox'}
        </button>
      </div>

      {adminMessages.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-xs">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No incoming messages</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Direct messages sent via Contact Admin will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {adminMessages.map(msg => (
            <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 relative">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base">{msg.name}</h4>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 mt-1 inline-block">
                    Contact: {msg.contact_info}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium leading-relaxed">
                "{msg.message}"
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onDeleteMessage(msg.id)}
                  className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-100 flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
