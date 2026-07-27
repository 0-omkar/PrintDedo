import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  showSubtitle?: boolean;
}

export function PrintDeDoLogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img 
      src="/logo.png" 
      alt="PrintDedo Logo Icon" 
      className={`${className} object-contain`}
    />
  );
}

export const BrandLogo = ({ size = 'md', href = '/', showSubtitle = false }: BrandLogoProps) => {
  const heightClass = size === 'sm' ? 'h-8 md:h-9' : size === 'lg' ? 'h-14 md:h-16' : size === 'xl' ? 'h-20 md:h-24' : 'h-10 md:h-12';

  const content = (
    <div className="flex items-center group cursor-pointer no-underline text-inherit select-none">
      <img 
        src="/logo.png" 
        alt="PrintDedo - Less Confusion. More Printing." 
        className={`${heightClass} w-auto object-contain group-hover:scale-105 transition-transform duration-200 pointer-events-none`}
      />
    </div>
  );

  if (href) {
    return <Link href={href} className="no-underline inline-block">{content}</Link>;
  }

  return content;
};
