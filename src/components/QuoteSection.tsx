import { useState, useEffect, useRef } from "react";
import { persona, personaLocales, type PersonaKey } from "../content/persona";

function QuoteSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteHeadingId = "quote-heading";
  const quoteContentId = "quote-content";
  const quoteCopyEn = {
    text: "Every thing we create carries intention. From the smallest interaction to the grandest vision, we believe technology should serve humanity with purpose and grace.",
    citation: "Things Inc. Philosophy"
  };
  const quoteCopyId = {
    text: "Setiap hal yang kami ciptakan membawa niat. Dari interaksi paling kecil hingga visi terbesar, teknologi seharusnya melayani manusia dengan tujuan dan keanggunan.",
    citation: "Filosofi Things Inc."
  };

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

  const QuoteImage = ({
    src,
    alt,
    altId,
    className,
    pillar
  }: {
    src: string;
    alt: string;
    altId?: string;
    className: string;
    pillar?: PersonaKey;
  }) => {
    const [loaded, setLoaded] = useState(false);
    const semanticTags = pillar
      ? persona.pillars.find(item => item.key === pillar)?.semanticTags.join(' ')
      : undefined;
    const localizedPillar = pillar ? personaLocales.id.pillars[pillar] : undefined;

    return (
      <div
        className="quote-item-wrapper relative"
        data-pillar={pillar}
        data-semantic-tags={semanticTags}
        role="listitem"
        aria-label={pillar ? `${personaLocales.en.pillars[pillar].title} visual anchor` : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={`quote-image transition-opacity duration-500 ${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          lang="en"
        />
        {(altId || localizedPillar) && (
          <span className="sr-only" lang="id">
            {altId ?? localizedPillar?.description}
          </span>
        )}
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
      className={`zen-quote-section lazy-section relative py-20 lg:py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      data-intrinsic="quote"
      role="region"
      aria-labelledby={quoteHeadingId}
      aria-describedby={quoteContentId}
      data-semantic-tags={persona.pillars.flatMap(pillar => pillar.semanticTags).join(' ')}
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
              <h2 id={quoteHeadingId} className="sr-only">Persona-aligned philosophy anchor</h2>
              <blockquote
                id={quoteContentId}
                className="text-2xl lg:text-4xl font-light text-white/90 leading-relaxed mb-8"
                lang="en"
              >
                <span className="text-pink-400">"</span>
                {quoteCopyEn.text}
                <span className="text-pink-400">"</span>
              </blockquote>
              <span className="sr-only" lang="id">
                {quoteCopyId.text}
              </span>
              <cite className="text-sm lg:text-base text-white/60 font-medium" lang="en">
                — {quoteCopyEn.citation}
              </cite>
              <span className="sr-only" lang="id">
                — {quoteCopyId.citation}
              </span>
            </div>

            {/* Visual Elements */}
            {imagesLoaded && (
              <div className="zen-visual-elements grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center opacity-50" role="list" aria-label="Persona visual anchors">
                <QuoteImage
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164b41e6cdbc1f70141b_switch.png"
                  alt="Zen pillar — a balanced switch symbolizing mindful transitions"
                  altId="Pilar Zen — sakelar seimbang yang melambangkan transisi penuh kesadaran"
                  className="w-16 h-16 mx-auto floating-ambient"
                  pillar="zen"
                />
                <QuoteImage
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bb78deb5be6f4476f_Kid.png"
                  alt="Nova pillar — playful energy represented by a curious kid"
                  altId="Pilar Nova — energi bermain yang diwakili anak penuh rasa ingin tahu"
                  className="w-16 h-16 mx-auto floating-ambient floating-ambient-delay"
                  pillar="nova"
                />
                <QuoteImage
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bf0d787f2a4cae332_slingshot.png"
                  alt="Informatika pillar — precision slingshot for intelligent function"
                  altId="Pilar Informatika — ketapel presisi untuk fungsi cerdas"
                  className="w-16 h-16 mx-auto floating-ambient"
                  pillar="informatika"
                />
                <QuoteImage
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f189c9bf07daf7a3e0e0e_Retro_TV_Off2.png"
                  alt="Nova pillar — retro television radiating modern energy"
                  altId="Pilar Nova — televisi retro yang memancarkan energi modern"
                  className="w-16 h-16 mx-auto floating-ambient floating-ambient-delay"
                  pillar="nova"
                />
                <QuoteImage
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f1d4f13326544cf71a234_train%20test%201.png"
                  alt="Informatika pillar — train network illustrating intelligent systems"
                  altId="Pilar Informatika — jaringan kereta yang menggambarkan sistem cerdas"
                  className="w-16 h-16 mx-auto floating-ambient"
                  pillar="informatika"
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