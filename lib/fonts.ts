import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

// Clash Display — display headings
export const clashDisplay = localFont({
  src: [
    {
      path: "../fonts-source/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts-source/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display-src",
  display: "swap",
});

// General Sans — body text
export const generalSans = localFont({
  src: [
    {
      path: "../fonts-source/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts-source/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-body-src",
  display: "swap",
});

// JetBrains Mono — eyebrows, code, labels
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
  display: "swap",
});
