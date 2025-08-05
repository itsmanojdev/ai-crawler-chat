import { Rubik, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./Components/ui/Navigation";
import { connectdb } from "../lib/mongodb";
import { ChatProvider } from "./context/ChatContext";


export const inter = Inter({ subsets: ['latin'] });
export const rubik = Rubik({ subsets: ['latin'] });

export const metadata = {
  title: "AI Crawler Chat",
  description: "AI Crawler Chat by",
};

export default async function RootLayout({ children }) {
  console.log("conneting...");

  await connectdb()
  console.log("connected");


  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`h-full flex flex-col text-sm ${rubik.className} ${inter.className} antialiased md:text-base`}
      >
        <header className="sticky top-0 z-100">
          <Navigation />
        </header>

        <main className="px-8 py-4 flex-1 flex flex-col sm:px-16">
          <ChatProvider>
            {children}
          </ChatProvider>
        </main>
      </body>
    </html>
  );
}
