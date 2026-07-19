import { Star, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  shopRating: number;
  setShopRating: (rating: number) => void;
  shopComment: string;
  setShopComment: (comment: string) => void;
  platformRating: number;
  setPlatformRating: (rating: number) => void;
  platformComment: string;
  setPlatformComment: (comment: string) => void;
  onSubmit: () => void;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  shopName = 'Print Shop',
  shopRating,
  setShopRating,
  shopComment,
  setShopComment,
  platformRating,
  setPlatformRating,
  platformComment,
  setPlatformComment,
  onSubmit,
}: ReviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-900 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-black uppercase tracking-tight mb-1">Write a Review</h3>
        <p className="text-xs text-slate-500 mb-6 font-medium">Rate your print shop experience and the PrintDedo platform.</p>
        
        <div className="space-y-6">
          {/* Card 1: Shop Review */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              1. Review for {shopName}
            </h4>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setShopRating(star)}
                  className="p-1 hover:scale-110 transition cursor-pointer border-none bg-transparent"
                >
                  <Star 
                    className={`w-7 h-7 ${star <= shopRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              placeholder={`Feedback for ${shopName}...`}
              value={shopComment}
              onChange={(e) => setShopComment(e.target.value)}
              maxLength={500}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-xs font-medium bg-white resize-none"
            />
          </div>

          {/* Card 2: PrintDedo Platform Review */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              2. Review for PrintDedo Platform
            </h4>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPlatformRating(star)}
                  className="p-1 hover:scale-110 transition cursor-pointer border-none bg-transparent"
                >
                  <Star 
                    className={`w-7 h-7 ${star <= platformRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              placeholder="Feedback for PrintDedo platform..."
              value={platformComment}
              onChange={(e) => setPlatformComment(e.target.value)}
              maxLength={500}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-xs font-medium bg-white resize-none"
            />
          </div>

          <button 
            onClick={onSubmit}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-3.5 rounded-xl transition shadow-sm border-none cursor-pointer text-xs uppercase tracking-wider"
          >
            Submit Reviews
          </button>
        </div>
      </div>
    </div>
  );
};
