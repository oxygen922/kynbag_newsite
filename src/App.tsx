import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import SearchModal from '@/components/SearchModal';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import BrandPage from '@/pages/Brand';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Shipping from '@/pages/Shipping';
import Returns from '@/pages/Returns';
import SizeGuide from '@/pages/SizeGuide';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-ivory">
        <Header />
        <main className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/brand/:brandSlug" element={<BrandPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
        <SearchModal />
      </div>
    </Router>
  );
}
