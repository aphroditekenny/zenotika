import {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
  lazy,
  Suspense,
  type ComponentType,
} from "react";
import { PageLoading, ProjectCardSkeleton } from "./LoadingStates";
import { useAccessibility } from "./AccessibilityProvider";
import Header from "./Header";
import { isFeatureEnabled } from "../featureFlags";
import { persona } from "../content/persona";
import type { PersonaKey } from "../content/persona";

const lazySectionsEnabled = isFeatureEnabled("lazyHomeSections");

type SectionComponent = ComponentType<unknown>;

let quoteSectionModulePromise: Promise<typeof import("./QuoteSection")> | null = null;
let logBookSectionModulePromise: Promise<typeof import("./LogBookSection")> | null = null;
let footerSectionModulePromise: Promise<typeof import("./FooterSection")> | null = null;

export function loadQuoteSectionModule() {
  if (!quoteSectionModulePromise) {
    quoteSectionModulePromise = import("./QuoteSection");
  }
  return quoteSectionModulePromise;
}

export function loadLogBookSectionModule() {
  if (!logBookSectionModulePromise) {
    logBookSectionModulePromise = import("./LogBookSection");
  }
  return logBookSectionModulePromise;
}

export function loadFooterSectionModule() {
  if (!footerSectionModulePromise) {
    footerSectionModulePromise = import("./FooterSection");
  }
  return footerSectionModulePromise;
}

export function preloadHomeSections() {
  if (!lazySectionsEnabled) {
    return Promise.resolve([]);
  }

  return Promise.all([
    loadQuoteSectionModule(),
    loadLogBookSectionModule(),
    loadFooterSectionModule(),
  ]);
}

let QuoteSectionComponent: SectionComponent;
let LogBookSectionComponent: SectionComponent;
let FooterSectionComponent: SectionComponent;

if (lazySectionsEnabled) {
  QuoteSectionComponent = lazy(() => loadQuoteSectionModule());
  LogBookSectionComponent = lazy(() => loadLogBookSectionModule());
  FooterSectionComponent = lazy(() => loadFooterSectionModule());
} else {
  const quoteModule = await loadQuoteSectionModule();
  const logBookModule = await loadLogBookSectionModule();
  const footerModule = await loadFooterSectionModule();

  QuoteSectionComponent = quoteModule.default as SectionComponent;
  LogBookSectionComponent = logBookModule.default as SectionComponent;
  FooterSectionComponent = footerModule.default as SectionComponent;
}

function SectionFallback({ label }: { label: string }) {
  return (
    <div className="section-fallback text-white/70 text-center py-16" role="status" aria-live="polite">
      <p className="text-lg tracking-wide">Loading {label}…</p>
    </div>
  );
}

function SectionRenderer({ Component, label }: { Component: SectionComponent; label: string }) {
  if (lazySectionsEnabled) {
    return (
      <Suspense fallback={<SectionFallback label={label} />}>
        <Component />
      </Suspense>
    );
  }

  return <Component />;
}

interface HomePageProps {
  onBackToLanding: () => void;
}

function HomePage({ onBackToLanding }: HomePageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { reducedMotion, screenReaderMode } = useAccessibility();

  useEffect(() => {
    if (lazySectionsEnabled) {
      void preloadHomeSections();
    }
  }, []);
  
  // Performance optimized scroll progress tracking
  const updateScrollProgress = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    let rafId: number;
    let isTracking = true;
    
    const handleScroll = () => {
      if (!isTracking || rafId) return;
      rafId = requestAnimationFrame(() => {
        if (isTracking) {
          updateScrollProgress();
        }
        rafId = 0;
      });
    };

    // Progressive loading - show skeleton first, then content
    const skeletonTimer = setTimeout(() => setIsLoaded(true), 200);
    const contentTimer = setTimeout(() => setContentLoaded(true), 800);

    // Initialize scroll progress
    updateScrollProgress();

    // Announce page change for screen readers
    if (screenReaderMode) {
      const announcer = document.getElementById('page-announcer');
      if (announcer) {
        // Semantic microcopy integrates Zenotika persona pillars without altering visual UI
        announcer.textContent = `Zenotika home page loaded. ${persona.tagline}`;
      }
    }

    window.addEventListener('scroll', handleScroll, { 
      passive: true 
    });

    return () => {
      isTracking = false;
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(skeletonTimer);
      clearTimeout(contentTimer);
    };
  }, [updateScrollProgress, screenReaderMode]);

  // Early return if not loaded to prevent flash
  if (!isLoaded) {
    return <PageLoading variant="home" message="Loading home page..." />;
  }

  // Show skeleton while content loads
  if (!contentLoaded) {
    return (
      <div className="home-page-wrapper">
        <div className="custom-background page-top">
          <div className="stars-overlay"></div>
        </div>
        
        <div 
          className="scroll-progress"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        
        <Header onBackToLanding={onBackToLanding} />
        
        <main className="main-wrapper" id="main-content">
          <div className="page-content_wrap">
            <section className="zen-hero-section py-20 lg:py-32">
              <div className="padding-global">
                <div className="container-xlarge">
                  <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="mb-8">
                      <div className="skeleton-loader skeleton-text" style={{ width: '20rem', height: '3rem', margin: '0 auto 2rem' }} />
                    </div>
                    <div className="mb-12">
                      <div className="skeleton-loader skeleton-text" style={{ width: '30rem', height: '1.25rem', margin: '0 auto 1rem' }} />
                      <div className="skeleton-loader skeleton-text" style={{ width: '25rem', height: '1.25rem', margin: '0 auto' }} />
                    </div>
                    
                    <ProjectCardSkeleton count={6} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page-wrapper">
      {/* Enhanced Background with Stars */}
      <div className="custom-background page-top">
        <div className="stars-overlay"></div>
      </div>
      
      {/* Zen Scroll Progress Indicator - Subtle, Informative */}
      <div 
        className="scroll-progress"
        style={{ 
          transform: `scaleX(${scrollProgress / 100})`,
        }}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      
      {/* Header */}
      <Header onBackToLanding={onBackToLanding} />
      
      <main className="main-wrapper" id="main-content" role="main">
        <div className="page-content_wrap">
          {/* Interactive Portfolio Section */}
          <InteractivePortfolioSection />

          {/* Quote Section */}
          <SectionRenderer Component={QuoteSectionComponent} label="quote section" />
          
          {/* About Section - Zenotika Philosophy */}
          <AboutSection />

          <SectionRenderer Component={LogBookSectionComponent} label="log book" />
        </div>

        <SectionRenderer Component={FooterSectionComponent} label="footer" />
      </main>
    </div>
  );
}

// Enhanced Project Data with Categories
const projectsData = [
  {
    id: 1,
    title: "Rooms",
    description: "Virtual spaces that foster meaningful digital connections through thoughtful design and seamless interaction.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164b41e6cdbc1f70141b_switch.png",
    category: "Digital Spaces",
    tags: ["Virtual Reality", "Social", "Innovation"],
    status: "Live",
    year: "2024"
  },
  {
    id: 2,
    title: "Things for Kids",
    description: "Playful learning experiences that nurture creativity while building foundational digital literacy.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bb78deb5be6f4476f_Kid.png",
    category: "Education",
    tags: ["Learning", "Kids", "Interactive"],
    status: "Development",
    year: "2024"
  },
  {
    id: 3,
    title: "Slingshot",
    description: "Precision tools that empower creators with efficient workflows and purposeful functionality.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f164bf0d787f2a4cae332_slingshot.png",
    category: "Tools",
    tags: ["Productivity", "Creators", "Efficiency"],
    status: "Beta",
    year: "2024"
  },
  {
    id: 4,
    title: "Retro TV",
    description: "Nostalgic entertainment reimagined for the modern era, blending comfort with contemporary functionality.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f189c9bf07daf7a3e0e0e_Retro_TV_Off2.png",
    category: "Entertainment",
    tags: ["Media", "Nostalgia", "Experience"],
    status: "Concept",
    year: "2025"
  },
  {
    id: 5,
    title: "Transport",
    description: "Efficient movement solutions that connect places and people through intelligent design systems.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/670f1d4f13326544cf71a234_train%20test%201.png",
    category: "Mobility",
    tags: ["Transport", "Efficiency", "Systems"],
    status: "Research",
    year: "2025"
  },
  {
    id: 6,
    title: "Neural Interface",
    description: "Thoughtful bridges between human cognition and digital systems, designed with care and precision.",
    image: "https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66ea3a5528a044beafcf917f_Logo_Icon.svg",
    category: "AI/ML",
    tags: ["AI", "Interface", "Future"],
    status: "Concept",
    year: "2025"
  }
];

const categories = ["All", "Digital Spaces", "Education", "Tools", "Entertainment", "Mobility", "AI/ML"];

const categoryPillarMap: Record<string, PersonaKey> = {
  "Digital Spaces": "zen",
  "Education": "nova",
  "Entertainment": "nova",
  "Mobility": "nova",
  "Tools": "informatika",
  "AI/ML": "informatika"
};

// Interactive Portfolio Section Component
const InteractivePortfolioSection = memo(function InteractivePortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projectsData);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = projectsData;
    
    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter(project => project.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredProjects(filtered);
  }, [activeCategory, searchQuery]);

  return (
    <section 
      id="our-things" 
      className="zen-portfolio-section py-20 lg:py-32"
      role="region"
      aria-labelledby="portfolio-heading"
    >
      <div className="padding-global">
        <div className="container-xlarge">
          
          {/* Section Header */}
          <div className={`text-center max-w-4xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 id="portfolio-heading" className="heading-style-h2 mb-8">
              Things that make you think
            </h1>
            <p className="intro-paragraph text-color-option-2 mb-12">
              We create thoughtful digital experiences that bridge creativity and functionality. 
              Each project reflects our philosophy of mindful design and purposeful innovation.
            </p>
            
            {/* Interactive Controls */}
            <div className="zen-portfolio-controls flex flex-col lg:flex-row items-center justify-center gap-6 mb-12" role="toolbar" aria-label="Portfolio filters">
              {/* Search */}
              <div className="zen-search-wrapper relative">
                <label htmlFor="project-search" className="sr-only">Search projects</label>
                <input
                  id="project-search"
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="zen-search-input bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 text-sm min-w-80 focus:outline-none focus:border-pink-400/50 focus:bg-white/15 transition-all duration-300"
                  aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">
                  Search through {projectsData.length} projects by title, description, or tags
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Category Filters */}
              <div className="zen-filter-buttons flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Filter by category">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`zen-filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                    style={{ transitionDelay: `${index * 0.1}s` }}
                    aria-pressed={activeCategory === category}
                    aria-describedby={`filter-${category.replace(/\s+/g, '-').toLowerCase()}-description`}
                    data-pillartone={categoryPillarMap[category]}
                    data-semantictags={categoryPillarMap[category]
                      ? persona.pillars.find(pillar => pillar.key === categoryPillarMap[category])?.semanticTags.join(' ')
                      : undefined}
                  >
                    {category}
                  </button>
                ))}
                <div className="sr-only">
                  {categories.map((category) => (
                    <div key={category} id={`filter-${category.replace(/\s+/g, '-').toLowerCase()}-description`}>
                      {category === "All" ? "Show all projects" : `Filter projects by ${category} category`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div 
            className="zen-projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            role="grid"
            aria-label={`${filteredProjects.length} projects ${activeCategory !== 'All' ? `in ${activeCategory} category` : ''} ${searchQuery ? `matching "${searchQuery}"` : ''}`}
          >
            {filteredProjects.map((project, index) => (
              <EnhancedProjectCard
                key={project.id}
                project={project}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
          
          {/* Results Announcement for Screen Readers */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {filteredProjects.length === 0 
              ? `No projects found ${searchQuery ? `for "${searchQuery}"` : ''} ${activeCategory !== 'All' ? `in ${activeCategory} category` : ''}`
              : `Showing ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} ${activeCategory !== 'All' ? `in ${activeCategory} category` : ''} ${searchQuery ? `matching "${searchQuery}"` : ''}`
            }
          </div>
          
          {/* No Results State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16" role="status" aria-live="polite">
              <div className="text-6xl mb-4 opacity-50" aria-hidden="true">🤔</div>
              <h3 className="text-xl text-white/80 mb-2">No projects found</h3>
              <p className="text-white/60">
                Try adjusting your search or filter criteria. 
                {searchQuery && (
                  <span className="block mt-2">
                    Current search: "{searchQuery}"
                  </span>
                )}
                {activeCategory !== 'All' && (
                  <span className="block mt-1">
                    Current filter: {activeCategory}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

// Enhanced Project Card Component
const EnhancedProjectCard = memo(function EnhancedProjectCard({ 
  project, 
  index,
  isVisible
}: { 
  project: any; 
  index: number;
  isVisible: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCardVisible(true), index * 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible, index]);

  const pillarKey = categoryPillarMap[project.category];
  const semanticTokens = pillarKey
    ? persona.pillars.find(pillar => pillar.key === pillarKey)?.semanticTags.join(' ')
    : undefined;

  return (
    <article 
      className={`enhanced-project-card zen-focus transform transition-all duration-700 ease-out ${
        cardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
      role="gridcell"
      tabIndex={0}
      aria-labelledby={`project-title-${project.id}`}
      aria-describedby={`project-description-${project.id} project-tags-${project.id}`}
      data-pillartone={pillarKey}
      data-semantictags={semanticTokens}
    >
      <div className="project-card_inner p-6">
        {/* Status Badge */}
        <div className="project-status-badge mb-4">
          <span 
            className={`status-badge px-3 py-1 rounded-full text-xs font-medium ${
              project.status === 'Live' ? 'bg-green-500/20 text-green-400' :
              project.status === 'Beta' ? 'bg-blue-500/20 text-blue-400' :
              project.status === 'Development' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-purple-500/20 text-purple-400'
            }`}
            aria-label={`Project status: ${project.status}`}
          >
            {project.status}
          </span>
          <span className="project-year text-white/40 text-xs ml-2" aria-label={`Year: ${project.year}`}>
            {project.year}
          </span>
        </div>
        
        {/* Project Image */}
        <div className="project-image-wrap mb-6 relative overflow-hidden rounded-2xl bg-white/5 group">
          <img 
            src={project.image}
            alt={`${project.title} - ${project.description}`}
            className={`w-full h-48 object-contain transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" role="img" aria-label="Loading project image" />
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" aria-hidden="true" />
        </div>
        
        {/* Project Content */}
        <div className="project-content">
          <div className="flex items-start justify-between mb-3">
            <h3 id={`project-title-${project.id}`} className="project-title text-lg font-semibold text-white">
              {project.title}
            </h3>
            <span 
              className="project-category text-xs text-pink-400 bg-pink-400/10 px-2 py-1 rounded-full"
              aria-label={`Category: ${project.category}`}
            >
              {project.category}
            </span>
          </div>
          
          <p 
            id={`project-description-${project.id}`}
            className="project-description text-sm text-white/70 leading-relaxed mb-4"
          >
            {project.description}
          </p>
          
          {/* Tags */}
          <div 
            className="project-tags flex flex-wrap gap-2"
            id={`project-tags-${project.id}`}
            aria-label={`Technologies: ${project.tags.join(', ')}`}
          >
            {project.tags.map((tag, tagIndex) => (
              <span 
                key={tagIndex}
                className="tag-badge text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full"
                role="listitem"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
});

// About Section - Zenotika Philosophy
const AboutSection = memo(function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="zen-about-section relative py-20 lg:py-32 overflow-hidden"
    >
      {/* Zenotika Background Enhancement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-48 h-48 bg-gradient-to-br from-blue-500/4 to-cyan-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-purple-500/3 to-pink-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
      </div>

      <div className="padding-global">
        <div className="container-xlarge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Story Content */}
            <div className={`zen-story-content transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <div className="zen-section-badge mb-6">
                <span className="section-badge bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 px-4 py-2 rounded-full text-sm font-medium">
                  Our Philosophy
                </span>
              </div>
              
              <h2 className="heading-style-h2 mb-8">
                Zenotika: The Art of Purposeful Creation
              </h2>
              
              <div className="zen-philosophy-breakdown space-y-8">
                {/* Zen */}
                <div className="philosophy-pillar">
                  <h3 className="text-xl text-white mb-3 flex items-center">
                    <span className="pillar-icon w-2 h-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full mr-3"></span>
                    Zen - Mindful Simplicity
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    We believe in the power of restraint. Every element serves a purpose, 
                    every interaction is intentional. Our designs breathe with space, 
                    allowing users to focus on what truly matters.
                  </p>
                </div>
                
                {/* Nova */}
                <div className="philosophy-pillar">
                  <h3 className="text-xl text-white mb-3 flex items-center">
                    <span className="pillar-icon w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-3"></span>
                    Nova - Modern Energy
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Innovation drives us forward, but not for its own sake. We harness 
                    contemporary technology and design language to create experiences 
                    that feel both cutting-edge and timeless.
                  </p>
                </div>
                
                {/* Informatika */}
                <div className="philosophy-pillar">
                  <h3 className="text-xl text-white mb-3 flex items-center">
                    <span className="pillar-icon w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-3"></span>
                    Informatika - Intelligent Function
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Behind every beautiful interface lies thoughtful architecture. 
                    We build systems that are not just functional, but elegantly efficient, 
                    scaling gracefully with human needs.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Visual Element */}
            <div className={`zen-visual-element transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`} style={{ transitionDelay: '0.3s' }}>
              <div className="zen-symbol-container relative">
                {/* Zenotika Symbol */}
                <div className="zen-symbol bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                  <div className="zen-triangle-arrangement flex items-center justify-center space-x-6 mb-8">
                    <div className="zen-dot w-4 h-4 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full animate-pulse"></div>
                    <div className="nova-dot w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="informatika-dot w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  </div>
                  
                  <h3 className="text-2xl text-white mb-4">Zenotika</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Where mindful design meets modern innovation and intelligent systems
                  </p>
                  
                  {/* Connection Lines */}
                  <svg className="zen-connections absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200">
                    <defs>
                      <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff7a8a" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                    <path d="M50,80 Q150,50 250,80" stroke="url(#connection-gradient)" strokeWidth="1" fill="none" className="animate-pulse"/>
                    <path d="M50,120 Q150,150 250,120" stroke="url(#connection-gradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }}/>
                  </svg>
                </div>
                
                {/* Floating Elements */}
                <div className="zen-floating-elements absolute inset-0 pointer-events-none">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-500/20 rounded-full blur-sm animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/2 -right-6 w-4 h-4 bg-blue-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Mission Statement */}
          <div className={`zen-mission-statement text-center mt-20 max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '0.6s' }}>
            <blockquote className="text-xl lg:text-2xl text-white/90 leading-relaxed italic">
              "We don't just build digital products—we craft thoughtful experiences that honor both human intuition and technological possibility."
            </blockquote>
            <cite className="text-white/60 text-sm mt-6 block">— Zenotika Team</cite>
          </div>
        </div>
      </div>
    </section>
  );
});

export default memo(HomePage);