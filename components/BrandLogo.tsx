import Link from 'next/link';
import { Printer } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showSubtitle?: boolean;
}

export const BrandLogo = ({ size = 'md', href = '/', showSubtitle = false }: BrandLogoProps) => {
  const iconPadding = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-3' : 'p-2.5';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl';

  const content = (
    <div className="flex flex-col justify-start group cursor-pointer no-underline text-inherit select-none">
      <div className="flex items-center space-x-3">
        <div className={`bg-yellow-400 ${iconPadding} rounded-2xl shadow-xs group-hover:scale-105 transition-transform duration-200 flex items-center justify-center shrink-0`}>
          <Printer className={`${iconSize} text-black`} />
        </div>
        <span className={`${textSize} font-black tracking-tight text-slate-950 leading-none flex items-center`}>
          Print<span className="text-yellow-500">Dedo</span>
        </span>
      </div>
      {showSubtitle && (
        <span className="text-[10px] text-slate-400 font-extrabold mt-1.5 tracking-widest uppercase">
          Smart Printing. Simplified.
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
