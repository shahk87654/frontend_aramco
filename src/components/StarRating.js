import React from 'react';

function StarRating({ value, onChange }) {
  return (
    <span>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{ cursor: 'pointer', color: value >= star ? '#FBBF24' : '#D1D5DB', fontSize: 24 }}
          onClick={() => onChange(star)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default StarRating;
