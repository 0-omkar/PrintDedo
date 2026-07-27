import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.printdedo.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PrintDeDo - Less Confusion. More Printing.",
    template: "%s | PrintDeDo",
  },
  description:
    "PrintDeDo replaces scattered WhatsApp print requests into a structured, trackable, and automated workflow for modern print shops and Xerox stores.",
  keywords: [
    "PrintDeDo",
    "online print management",
    "xerox shop software",
    "print shop workflow",
    "document printing",
    "whatsapp printing automation",
    "cloud printing solution",
    "print order tracking",
  ],
  applicationName: "PrintDeDo",
  authors: [{ name: "PrintDeDo", url: baseUrl }],
  creator: "PrintDeDo",
  publisher: "PrintDeDo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "PrintDeDo - Less Confusion. More Printing.",
    description:
      "Replace chaotic WhatsApp print orders with a streamlined, structured web workflow for modern Xerox and print shops.",
    url: baseUrl,
    siteName: "PrintDeDo",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/icon.png`,
        width: 512,
        height: 512,
        alt: "PrintDeDo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintDeDo - Less Confusion. More Printing.",
    description:
      "Transform your print shop operations with PrintDeDo. Streamlined document printing and order tracking.",
    images: [`${baseUrl}/icon.png`],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${baseUrl}/#webapp`,
      name: "PrintDeDo",
      url: baseUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      description:
        "PrintDeDo converts chaotic WhatsApp print requests into a structured, trackable workflow for modern print shops.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "PrintDeDo",
      url: baseUrl,
      logo: `${baseUrl}/icon.png`,
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Toaster position="top-center" richColors theme="light" />
        {children}
      </body>
    </html>
  );
}
