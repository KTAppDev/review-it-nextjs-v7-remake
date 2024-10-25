import "@/app/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Poppins } from "next/font/google";
import Navbar from "./components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "./util/QueryProvider";
import JotaiProvider from "./util/JotaiProvider";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

const APP_NAME = "Review It";
const APP_DEFAULT_TITLE = "Review It";
const APP_TITLE_TEMPLATE = "%s - Review It";
const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/dhglzlaqf/image/upload/v1724077586/reviewit/logo_eqake5.png";
const APP_DESCRIPTION =
  "Review It is a website where you can share and read reviews on anything. It is easy, fun, and free to use.";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  style: "normal",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    // card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JotaiProvider>
      <ClerkProvider>
        <QueryProvider>
          <html className="bg-myTheme-lightbg " lang="en">
            <head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
              />
              {/* Google Tag Manager Script */}
              <Script
                id="google-analytics"
                async
                src="https://www.googletagmanager.com/gtag/js?id=G-D99RMSQKN0" // Replace with your Measurement ID
              />
              <Script id="google-analytics-init" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-D99RMSQKN0'); // Replace with your Measurement ID
          `}
              </Script>
            </head>
            <body className={`${poppins.className} bg-myTheme-lightbg  `}>
              <Navbar>{children}</Navbar>
              <ReactQueryDevtools initialIsOpen={false} />
            </body>
          </html>
        </QueryProvider>
      </ClerkProvider>
    </JotaiProvider>
  );
}
