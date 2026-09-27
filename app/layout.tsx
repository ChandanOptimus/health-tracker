import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata = {
  title: "Health Tracker",
  description:
    "Personal health, nutrition and workout tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />

          <main className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}