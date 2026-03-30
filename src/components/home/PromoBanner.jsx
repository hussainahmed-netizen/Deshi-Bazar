import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PromoBanner({ imageUrl }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={imageUrl}
          alt="Special offer banner"
          className="w-full h-40 md:h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40 flex items-center">
          <div className="px-6 md:px-12 text-white space-y-3">
            <p className="text-xs md:text-sm font-medium opacity-90">Limited Time Offer</p>
            <h3 className="font-heading text-2xl md:text-4xl font-bold">Up to 50% OFF</h3>
            <p className="text-sm opacity-90 max-w-xs">On selected fashion items. Don't miss out!</p>
            <Link to="/products">
              <Button variant="secondary" size="sm" className="font-semibold mt-1">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}