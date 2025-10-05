import { useState, useEffect, useRef } from "react";

function QuoteSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Preload images when section comes into view
          preloadImages();
        }
      },
      { rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const preloadImages = () => {
    const imageUrls = [
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164b41e6cdbc1f70141b_switch.png",
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bb78deb5be6f4476f_Kid.png",
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bf0d787f2a4cae332_slingshot.png",
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f189c9bf07daf7a3e0e0e_Retro_TV_Off2.png",
      "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f1d4f13326544cf71a234_train%20test%201.png"
    ];

    const imagePromises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
        img.src = url;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  };

  const QuoteImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
    const [loaded, setLoaded] = useState(false);
    
    return (
      <div className="quote-item-wrapper relative">
        <img 
          src={src}
          alt={alt}
          className={`quote-image transition-opacity duration-500 ${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {!loaded && (
          <div className={`quote-image-placeholder bg-white/10 animate-pulse ${className}`} />
        )}
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      id="philosophy"
      className={`zen-quote-section relative py-20 lg:py-32 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Background Enhancement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="padding-global">
        <div className="container-xlarge">
          <div className="text-center max-w-4xl mx-auto">
            {/* Philosophy Quote */}
            <div className="zen-quote-content mb-16">
              <blockquote className="text-2xl lg:text-4xl font-light text-white/90 leading-relaxed mb-8">
                <span className="text-pink-400">"</span>
                Every thing we create carries intention. From the smallest interaction to the grandest vision, 
                we believe technology should serve humanity with purpose and grace.
                <span className="text-pink-400">"</span>
              </blockquote>
              <cite className="text-sm lg:text-base text-white/60 font-medium">
                — Things Inc. Philosophy
              </cite>
            </div>

            {/* Visual Elements */}
            {imagesLoaded && (
              <div className="zen-visual-elements grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center opacity-50">
                <QuoteImage 
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164b41e6cdbc1f70141b_switch.png"
                  alt="Switch"
                  className="w-16 h-16 mx-auto floating-ambient"
                />
                <QuoteImage 
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bb78deb5be6f4476f_Kid.png"
                  alt="Kid"
                  className="w-16 h-16 mx-auto floating-ambient floating-ambient-delay"
                />
                <QuoteImage 
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bf0d787f2a4cae332_slingshot.png"
                  alt="Slingshot"
                  className="w-16 h-16 mx-auto floating-ambient"
                />
                <QuoteImage 
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f189c9bf07daf7a3e0e0e_Retro_TV_Off2.png"
                  alt="Retro TV"
                  className="w-16 h-16 mx-auto floating-ambient floating-ambient-delay"
                />
                <QuoteImage 
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f1d4f13326544cf71a234_train%20test%201.png"
                  alt="Train"
                  className="w-16 h-16 mx-auto floating-ambient"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuoteSection;