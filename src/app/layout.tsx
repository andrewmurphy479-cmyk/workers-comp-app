import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workers Comp Command Center",
  description:
    "Guided workers' compensation incident management for Arkansas employers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-warm-50 text-warm-800 min-h-screen antialiased">
        <header className="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-sage-500 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-warm-900 leading-tight group-hover:text-sage-700 transition-colors">
                  Workers Comp Command Center
                </h1>
                <p className="text-xs text-warm-500">Arkansas Employer Guide</p>
              </div>
            </a>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>

        <footer className="border-t border-warm-200 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <p className="text-xs text-warm-500 text-center leading-relaxed">
              <strong className="text-warm-600">Disclaimer:</strong> This tool
              provides general guidance and is not legal advice. Consult a
              qualified attorney for legal questions specific to your situation.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
