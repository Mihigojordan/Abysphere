import HeroSection from '../../components/landing/home/HeroSection';
import Categories from '../../components/landing/home/Categories';
import Featured from '../../components/landing/home/Featured';
import ImpactSection from '../../components/landing/home/ImpactSection';
import Testimonials from '../../components/landing/home/Testimonials';
import Newsletter from '../../components/landing/home/Newsletter';

const Home = () => {
  const handleExplore = () => {
    const el = document.querySelector('#shop');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main style={{ background: 'var(--aby-bg)' }}>
      <HeroSection onExplore={handleExplore} />
      <Categories />
      <Featured />
      <ImpactSection />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
