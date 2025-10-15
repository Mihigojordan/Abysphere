import React from 'react'
import HeroSection from '../../components/landing/home/HeroSection';
import Categories from '../../components/landing/home/Categories';
import FeaturedProducts from '../../components/landing/home/Featured';
import Testimonials from '../../components/landing/home/Testimonials';
import Blog from '../../components/landing/home/Blog';
import AboutSection from '../../components/landing/home/About';

const Home = () => {
  return (
    <main>
        
        <HeroSection />
        <AboutSection />
        <Categories />
        <Testimonials />
        <Blog />
 
      </main>
  )
}

export default Home