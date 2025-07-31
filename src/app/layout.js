import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'My Website',
  description: 'Full-stack Next.js app',
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
