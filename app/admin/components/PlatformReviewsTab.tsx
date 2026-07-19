import { Star, Trash2, Calendar, Store } from 'lucide-react';
import { PlatformReview } from '../types';

interface PlatformReviewsTabProps {
  reviews: PlatformReview[];
  onDeleteReview: (id: string) => void;
}

export const PlatformReviewsTab = ({
  reviews,
  onDeleteReview,
}: PlatformReviewsTabProps) => {
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-950 tracking-tight">PrintDedo Platform Reviews</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage customer feedback submitted directly for the PrintDedo platform.</p>
        </div>

        <div className="flex items-center space-x-3 bg-yellow-50 border border-yellow-200 px-4 py-2.5 rounded-2xl">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <div>
            <p className="text-lg font-black text-slate-950 leading-none">{averageRating} / 5.0</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{reviews.length} Total Platform Reviews</p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Platform Reviews Yet</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Customer reviews for PrintDedo will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-950">{item.name || 'Anonymous'}</span>
                    {item.shop_name && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Store className="w-3 h-3 text-slate-400" />
                        {item.shop_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 ${s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium mt-3 leading-relaxed">
                  {item.comment ? `"${item.comment}"` : <span className="italic text-slate-400">No written comment provided.</span>}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-400">
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
          ))}
        </div>
      )}
    </div>
  );
};
