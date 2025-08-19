import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'OROVE',
  description: 'Full-stack Next.js app',
  icons: {
    icon: "/orove-logo2.png", // <-- your logo here
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
       
        <main>{children}</main>
      </body>
    </html>
  )
}
