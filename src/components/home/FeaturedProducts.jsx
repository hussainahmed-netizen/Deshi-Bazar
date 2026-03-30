import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts({ products, title = "Featured Products" }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{title}</h2>
        <Link to="/products" className="text-sm text-primary font-medium hover:underline">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}