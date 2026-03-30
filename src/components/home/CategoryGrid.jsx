import { Link } from 'react-router-dom';

const defaultCategories = [
  { name: "Men's Fashion", slug: "mens", icon: "👔" },
  { name: "Women's Fashion", slug: "womens", icon: "👗" },
  { name: "Kids", slug: "kids", icon: "🧒" },
  { name: "Accessories", slug: "accessories", icon: "⌚" },
  { name: "Footwear", slug: "footwear", icon: "👟" },
  { name: "Traditional", slug: "traditional", icon: "🥻" },
];

export default function CategoryGrid({ categories = [] }) {
  const activeFromDB = categories.filter(c => c.is_active !== false);
  const displayCategories = categories.length > 0 ? activeFromDB : defaultCategories;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">Shop by Category</h2>
        <Link to="/products" className="text-sm text-primary font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card border hover:border-primary/30 hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                cat.icon || "🛍️"
              )}
            </div>
            <span className="text-xs md:text-sm font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}