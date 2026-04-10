import React from 'react';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: number;
  animated?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 3,
  size = 32,
  animated = false,
}) => {
  return (
    <div className="flex gap-1 items-center justify-center">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < stars;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={animated ? 'star-pop' : ''}
            style={animated ? { animationDelay: `${i * 0.15}s` } : undefined}
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={filled ? '#fbbf24' : '#d1d5db'}
              stroke={filled ? '#f59e0b' : '#9ca3af'}
              strokeWidth={1}
            />
          </svg>
        );
      })}
    </div>
  );
};

export default StarRating;
