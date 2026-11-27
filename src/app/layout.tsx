import type { Metadata, Viewport } from "next";
import { Playfair_Display, Anton, Space_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import MobileBottomNav from "@/components/MobileBottomNav";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A1525",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tutallermovil.vercel.app"),
  title: "TuTallerMóvil | Mecánica Automotriz a Domicilio en Caracas",
  description:
    "Mecánica automotriz a domicilio en Caracas. Diagnóstico desde $15, garantía escrita de 90 días, llegada en menos de 45 minutos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TuTallerMóvil",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: "https://tutallermovil.vercel.app",
  },
  openGraph: {
    title: "TuTallerMóvil | Mecánica Automotriz a Domicilio en Caracas",
    description:
      "Mecánica automotriz a domicilio en Caracas. Diagnóstico desde $15, garantía escrita de 90 días, llegada en menos de 45 minutos.",
    url: "https://tutallermovil.vercel.app",
    siteName: "TuTallerMóvil",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 600,
        alt: "Logo oficial de TuTallerMóvil",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuTallerMóvil | Mecánica Automotriz a Domicilio en Caracas",
    description:
      "Mecánica automotriz a domicilio en Caracas. Diagnóstico desde $15, garantía escrita de 90 días, llegada en menos de 45 minutos.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "Tu Taller Móvil",
    "description":
      "Mecánica automotriz a domicilio en Caracas. Diagnóstico desde $15, garantía escrita de 90 días, llegada en menos de 45 minutos.",
    "url": "https://tutallermovil.vercel.app",
    "logo": "https://tutallermovil.vercel.app/icon.svg",
    "image": "https://tutallermovil.vercel.app/icon.svg",
    "telephone": "+584142314194",
    "priceRange": "$$",
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Municipio Libertador, Caracas"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Municipio Chacao, Caracas"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Municipio Baruta, Caracas"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Municipio Sucre, Caracas"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Municipio El Hatillo, Caracas"
      }
    ],
    "serviceType": [
      "Mecánica a domicilio",
      "Diagnóstico OBD2",
      "Mantenimiento preventivo"
    ]
  };

  return (
    <html
      lang="es-VE"
      className={`${playfair.variable} ${anton.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://iixmdbkckvypujqpkfsf.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://iixmdbkckvypujqpkfsf.supabase.co" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#0A1525] selection:bg-[#CCFF00] selection:text-[#050505] overflow-x-hidden pb-24 md:pb-0">
        <CustomCursor />
        <PageTransition>{children}</PageTransition>
        <MobileBottomNav />
      </body>
    </html>
  );
}
