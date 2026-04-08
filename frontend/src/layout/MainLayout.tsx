import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import CartSidebar from '../components/landing/CartSidebar'
import { CartProvider } from '../context/CartContext'

const MainLayout = () => {
  const location = useLocation()

  useEffect(() => {
    document.body.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [location.pathname])

  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', background: 'var(--aby-bg)' }}>
        <Navbar />
        <Outlet />
        <Footer />
        <CartSidebar />
      </div>
    </CartProvider>
  )
}

export default MainLayout
