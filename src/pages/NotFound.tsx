// 404 页
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-8xl md:text-9xl font-light text-champagne/40 mb-4">
          404
        </h1>
        <h2 className="font-serif text-3xl font-light text-ink mb-4">
          Page Not Found
        </h2>
        <p className="text-ink/50 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-ink text-ivory px-8 py-3.5 text-sm font-medium tracking-wide rounded hover:bg-stone-750 transition-all"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 border border-ink/30 text-ink px-8 py-3.5 text-sm font-medium tracking-wide rounded hover:border-champagne hover:text-champagne transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
