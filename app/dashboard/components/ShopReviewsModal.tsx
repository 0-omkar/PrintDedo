import { Star, X, Trash2, Calendar } from 'lucide-react';

export interface ShopReviewItem {
  id: string;
  name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface ShopReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ShopReviewItem[];
  onDeleteReview: (id: string) => void;
}

export const ShopReviewsModal = ({
  isOpen,
  onClose,
  reviews,
  onDeleteReview,
}: ShopReviewsModalProps) => {
  if (!isOpen) return null;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-900 max-h-[85vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pr-8">
          <div className="bg-yellow-400 p-2.5 rounded-2xl shrink-0">
            <Star className="w-6 h-6 text-black fill-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Customer Reviews</h3>
            <p className="text-xs font-semibold text-slate-500">
              {averageRating} Rating • {reviews.length} Total Reviews
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {reviews.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-4">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No shop reviews yet.</p>
              <p className="text-[11px] text-slate-400 font-medium">Customer reviews left for your shop will appear here.</p>
            </div>
          ) : (
            reviews.map((item) => (
              <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-extrabold text-xs text-slate-900">{item.name || 'Anonymous'}</span>
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {item.comment ? `"${item.comment}"` : <span className="italic text-slate-400">No written comment provided.</span>}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onDeleteReview(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 border-none bg-transparent cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
