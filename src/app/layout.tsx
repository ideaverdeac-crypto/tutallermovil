import type { Metadata } from "next";
import { Playfair_Display, Anton, Space_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic", "normal"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tutallermovil.vercel.app"),
  title: "TuTallerMóvil | Mecánica Automotriz a Domicilio en Caracas",
  description:
    "Mecánica automotriz a domicilio en Caracas. Diagnóstico desde $15, garantía escrita de 90 días, llegada en menos de 45 minutos.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${anton.variable} ${spaceMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white selection:bg-[#CCFF00] selection:text-[#050505] uppercase">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
