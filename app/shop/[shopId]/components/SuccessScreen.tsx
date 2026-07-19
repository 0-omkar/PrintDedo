import { CheckCircle, Plus, Star } from 'lucide-react';
import { XeroxLogoSVG } from '@/components/XeroxLogoSVG';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
import { BrandLogo } from '@/components/BrandLogo';
import { ReviewModal } from './ReviewModal';

interface SuccessScreenProps {
  shopName?: string;
  logo?: string;
  name: string;
  submittedDocCount: number;
  onAttachAnother: () => void;
  reviewSubmitted: boolean;
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  shopRating: number;
  setShopRating: (rating: number) => void;
  shopComment: string;
  setShopComment: (comment: string) => void;
  platformRating: number;
  setPlatformRating: (rating: number) => void;
  platformComment: string;
  setPlatformComment: (comment: string) => void;
  onAddReview: () => void;
}

export const SuccessScreen = ({
  shopName,
  logo,
  name,
  submittedDocCount,
  onAttachAnother,
  reviewSubmitted,
  isReviewOpen,
  setIsReviewOpen,
  shopRating,
  setShopRating,
  shopComment,
  setShopComment,
  platformRating,
  setPlatformRating,
  platformComment,
  setPlatformComment,
  onAddReview,
}: SuccessScreenProps) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-between py-8 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <header className="relative z-10 w-full max-w-md flex justify-center mb-6">
        <BrandLogo size="md" />
      </header>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 mb-6">
          {logo ? (
            <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
          ) : (
            <XeroxLogoSVG />
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center text-slate-950 uppercase w-full">
          {shopName || 'Loading...'}
        </h1>
        <p className="text-slate-500 text-center text-xs font-semibold tracking-wide uppercase mt-2 w-full mb-8">
          XEROX • PRINT • SCAN • LAMINATION
        </p>

        <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-8 w-full shadow-sm text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Print Request Sent!</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Your document has been sent directly to <strong>{shopName}</strong>'s live queue.
          </p>
          <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4 text-xs font-semibold text-slate-700">
            Please show your name (<strong>{name}</strong>) to the shop owner after you receive your {submittedDocCount > 1 ? `${submittedDocCount} print orders` : 'prints'} to collect.
          </div>
        </div>

        <button 
          onClick={onAttachAnother}
          className="w-full bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition cursor-pointer border-none shadow-sm flex items-center justify-center gap-2 mt-4"
        >
          <Plus className="w-5 h-5" />
          <span>Attach Another Document</span>
        </button>

        {!reviewSubmitted && (
          <button 
            onClick={() => {
              setShopRating(5);
              setShopComment('');
              setPlatformRating(5);
              setPlatformComment('');
              setIsReviewOpen(true);
            }}
            className="w-full mt-3 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Write a Review</span>
          </button>
        )}

        {reviewSubmitted && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-xs font-bold text-center w-full">
            Reviews submitted! Thank you.
          </div>
        )}
      </div>

      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        shopName={shopName}
        shopRating={shopRating}
        setShopRating={setShopRating}
        shopComment={shopComment}
        setShopComment={setShopComment}
        platformRating={platformRating}
        setPlatformRating={setPlatformRating}
        platformComment={platformComment}
        setPlatformComment={setPlatformComment}
        onSubmit={onAddReview}
      />
    </div>
  );
};
