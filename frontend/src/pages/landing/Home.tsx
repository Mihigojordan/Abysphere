import React from 'react'
import HeroSection from '../../components/landing/home/HeroSection';
import Categories from '../../components/landing/home/Categories';
import Featured from '../../components/landing/home/Featured';
import Testimonials from '../../components/landing/home/Testimonials';
import Blog from '../../components/landing/home/Blog';
import AboutSection from '../../components/landing/home/About';
import WhyChooseUsSection from '../../components/landing/home/WhyChooseUsSection';

const Home = () => {
  return (
    <main>
        
        <HeroSection />
          <AboutSection />
        <Categories />  
      
        <Featured />
        <Testimonials />
        <WhyChooseUsSection />
        <Blog />
 
      </main>
  )
}

export default Home