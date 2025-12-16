import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HRPolicy from '@/components/HRPolicy';
import News from '@/components/News';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HRPolicy />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
