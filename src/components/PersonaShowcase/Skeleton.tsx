import React from 'react';

export function PersonaShowcaseSkeleton() {
  return (
    <section aria-label="Loading personas" className="persona-skeleton">
      <div className="persona-skeleton__grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="persona-skeleton__card shimmer" />
        ))}
      </div>
    </section>
  );
}

export default PersonaShowcaseSkeleton;
