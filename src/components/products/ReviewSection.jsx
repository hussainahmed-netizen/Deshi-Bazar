import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    db.entities.Review.filter({ product_id: productId }, '-created_date', 20).then(setReviews);
  }, [productId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const user = await db.auth.me();
    await db.entities.Review.create({
      product_id: productId,
      user_email: user.email,
      user_name: user.full_name || 'Anonymous',
      rating,
      comment,
    });
    toast.success('Review submitted!');
    setComment('');
    setShowForm(false);
    const updated = await db.entities.Review.filter({ product_id: productId }, '-created_date', 20);
    setReviews(updated);
    setSubmitting(false);
  };

  return (
    <section className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold">Reviews ({reviews.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          Write a Review
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`h-5 w-5 transition-colors ${s <= rating ? 'fill-primary text-primary' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {(review.user_name || 'A')[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.user_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}