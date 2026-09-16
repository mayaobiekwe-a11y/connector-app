export default function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "text-amber-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
