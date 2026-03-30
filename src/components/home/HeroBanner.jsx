import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner({ imageUrl }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 animate-slide-up">
            <div className="inline-block">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                New Collection 2026
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Your
              <span className="text-primary block">Perfect Style</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
              Shop the latest trends in Bangladeshi fashion. From traditional elegance to modern streetwear — all at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="font-semibold gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products?category=womens">
                <Button variant="outline" size="lg" className="font-semibold">
                  Women's Collection
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={imageUrl}
                alt="DeshiBazar Fashion Collection"
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -left-3 bg-card rounded-xl shadow-lg p-3 border">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="font-heading text-xl font-bold text-primary">৳299</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}