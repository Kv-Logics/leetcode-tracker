import './globals.css';

export const metadata = {
  title: 'LeetCode Tracker | SaaS Dashboard',
  description: 'Track your LeetCode progress with modern analytics',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
