import React from 'react';

/** Lightweight visual placeholder while HeroSection code chunk loads */
export function HeroSectionSkeleton() {
  return (
    <section aria-label="Loading hero" className="hero-skeleton">
      <div className="hero-skeleton__bg shimmer" />
      <div className="hero-skeleton__content">
        <div className="hero-skeleton__line hero-skeleton__line--lg" />
        <div className="hero-skeleton__line hero-skeleton__line--md" />
        <div className="hero-skeleton__actions">
          <div className="hero-skeleton__btn" />
          <div className="hero-skeleton__btn" />
        </div>
      </div>
    </section>
  );
}

export default HeroSectionSkeleton;
