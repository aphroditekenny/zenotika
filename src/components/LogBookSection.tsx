import { IntersectionObserver } from './IntersectionObserver';
import { useState, useRef, useEffect, memo } from 'react';

function LogBookSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCardsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const FloatingAccent = ({ className, delay = 0 }: { className: string; delay?: number }) => (
    <div 
      className={`absolute w-1 h-1 bg-gradient-to-r from-pink-400/40 to-purple-400/40 rounded-full animate-pulse ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );

  const logEntries = [
    {
      id: 1,
      date: "2025.01.05",
      title: "Zen Framework Implementation",
      content: "Integrated mindful design principles into our core development process. Focus on intentional interactions and reduced cognitive load.",
      tags: ["Philosophy", "UX", "Framework"]
    },
    {
      id: 2,
      date: "2025.01.03",
      title: "Nova Energy Systems",
      content: "Launched modern energy-efficient backend architecture. 60% performance improvement across all digital experiences.",
      tags: ["Performance", "Backend", "Optimization"]
    },
    {
      id: 3,
      date: "2024.12.28",
      title: "Informatika Protocol",
      content: "Established clean data structures and efficient algorithms. Every line of code serves a purpose, nothing superfluous.",
      tags: ["Architecture", "Efficiency", "Clean Code"]
    }
  ];

  return (
    <IntersectionObserver 
      className="home-logs relative py-20 lg:py-32 overflow-hidden"
      onIntersect={() => setIsVisible(true)}
    >
      <div id="log-book" className="padding-global">

      </div>
      
      {/* Zenotika Enhanced Background - Zen + Nova + Informatika */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Zen Layer: Calm, Mindful Starfield */}
        <div className="stars-overlay logbook-stars absolute inset-0 opacity-30"></div>
        
        {/* Nova Layer: Modern Energy Gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-1/5 left-1/5 w-40 h-40 bg-gradient-to-br from-pink-500/6 to-purple-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-1/4 right-1/5 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-br from-purple-500/4 to-pink-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-36 h-36 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '9s' }}></div>
        </div>
        
        {/* Informatika Layer: Efficient, Geometric Accents */}
        <div className="absolute inset-0">
          <FloatingAccent className="top-12 left-12" delay={0} />
          <FloatingAccent className="top-24 right-24" delay={2} />
          <FloatingAccent className="bottom-24 left-24" delay={4} />
          <FloatingAccent className="bottom-12 right-12" delay={6} />
          <FloatingAccent className="top-1/3 left-1/2" delay={8} />
          <FloatingAccent className="bottom-1/3 right-1/2" delay={10} />
        </div>
        
        {/* Zenotika Unity: Subtle Connecting Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="zenotika-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7a8a" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.05"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <path d="M0,400 Q360,200 720,300 T1440,250" stroke="url(#zenotika-gradient)" strokeWidth="1" fill="none" className="animate-pulse"/>
            <path d="M0,500 Q360,300 720,400 T1440,350" stroke="url(#zenotika-gradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDelay: '2s' }}/>
          </svg>
        </div>
      </div>
    </IntersectionObserver>
  );
}

// Optimized Log Entry Component
const LogEntry = memo(function LogEntry({ 
  entry, 
  index, 
  isVisible 
}: { 
  entry: any; 
  index: number; 
  isVisible: boolean; 
}) {
  return (
    <div 
      className={`log-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 transform transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 0.2}s` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
        <div className="log-date text-sm text-pink-400 font-mono bg-pink-400/10 px-3 py-1 rounded-full w-fit">
          {entry.date}
        </div>
        
        <div className="flex-1">
          <h3 className="log-title text-lg lg:text-xl text-white mb-3">{entry.title}</h3>
          <p className="log-content text-white/70 leading-relaxed mb-4">{entry.content}</p>
          
          <div className="log-tags flex flex-wrap gap-2">
            {entry.tags.map((tag: string, tagIndex: number) => (
              <span 
                key={tagIndex}
                className="tag bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default memo(LogBookSection);