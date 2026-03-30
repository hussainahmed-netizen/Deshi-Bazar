import { db } from '@/lib/db';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    title: 'New Collection 2026',
    subtitle: 'Discover the latest trends in fashion. Premium quality at unbeatable prices.',
    button_text: 'Shop Now',
    button_link: '/products',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    bg_color: '#fff7ed',
  },
  {
    id: 'fallback-2',
    title: 'Flash Sale Live!',
    subtitle: 'Up to 50% off on selected items. Limited time offer.',
    button_text: 'Grab Deals',
    button_link: '/products',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    bg_color: '#fff1f2',
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.HeroSlide.filter({ is_active: true }, 'order', 20)
      .then(data => {
        setSlides(data.length > 0 ? data : FALLBACK_SLIDES);
        setLoading(false);
      })
      .catch(() => { setSlides(FALLBACK_SLIDES); setLoading(false); });
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [slides.length, next]);

  if (loading || slides.length === 0) {
    return <div className="h-[420px] md:h-[500px] bg-secondary animate-pulse rounded-none" />;
  }

  const slide = slides[current];

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: slide.bg_color || '#fff7ed', minHeight: '420px' }}
    >
      {/* Slide */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8 min-h-[420px]">
        {/* Text */}
        <div className="flex-1 text-center md:text-left animate-fade-in">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            DeshiBazar
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-md mx-auto md:mx-0">
              {slide.subtitle}
            </p>
          )}
          {slide.button_text && (
            <Link to={slide.button_link || '/products'}>
              <Button size="lg" className="font-semibold px-8">
                {slide.button_text}
              </Button>
            </Link>
          )}
        </div>
        {/* Image */}
        {slide.image_url && (
          <div className="flex-1 flex justify-center">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full max-w-sm md:max-w-md h-60 md:h-80 object-cover rounded-2xl shadow-xl"
            />
          </div>
        )}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-primary/30 w-2'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}