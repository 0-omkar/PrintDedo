import QRCode from 'react-qr-code';
import { BrandLogo } from '@/components/BrandLogo';
import { Printer } from 'lucide-react';

interface PrintableQRPosterProps {
  userId: string;
  origin: string;
  shopName: string;
}

export const PrintableQRPoster = ({ userId, origin, shopName }: PrintableQRPosterProps) => {
  if (!userId || !origin) return null;

  return (
    <div className="hidden print:flex flex-col items-center justify-between w-full h-[98vh] p-6 text-center bg-white text-slate-950 font-sans space-y-3 m-0 box-border">
      {/* Top Header Section */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <BrandLogo size="lg" showSubtitle />
        <div className="w-20 h-1 bg-yellow-400 rounded-full my-1" />
        <div className="space-y-0.5">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-950">{shopName || 'Print Shop'}</h1>
        </div>
      </div>

      {/* Main Large QR Code Box - Spans from shop name to scan instructions */}
      <div className="p-6 md:p-8 bg-white border-[7px] border-yellow-400 rounded-[3rem] shadow-xl relative w-[85%] max-w-[650px] aspect-square flex items-center justify-center my-1">
        <QRCode
          value={`${origin}/shop/${userId}`}
          size={600}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox="0 0 256 256"
          level="H"
        />
        {/* Center Logo Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-yellow-400 px-5 py-3 rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center gap-2 scale-125">
            <Printer className="w-6 h-6 text-black" />
            <span className="text-sm font-black text-black leading-none tracking-tight">PrintDedo</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-3 w-full max-w-lg">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
            Scan QR Code to Print
          </h2>
          <p className="text-xs font-semibold text-slate-600 leading-normal">
            Point your mobile camera at this QR code to upload PDFs directly to <strong>{shopName}</strong>'s live print queue.
          </p>
        </div>

        <div className="pt-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest border-t border-slate-100 w-full max-w-xs">
          Powered by PrintDeDo • Less Confusion. More Printing.
        </div>
      </div>
    </div>
  );
};
