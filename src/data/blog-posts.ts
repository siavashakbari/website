import imgBranding from "../assets/brand/hero/brand-hero-01.jpg";
import imgPhotography from "../assets/fashion/atlasi/fashion-atlasi-01.jpg";
import imgNews1 from "../assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg";
import imgNews2 from "../assets/graphic-design/nozad-publication/graphic-design-nozad-publication-01.jpg";

export type BlogCategory = "my-blogs" | "news";

export interface BlogCategoryMeta {
  key: BlogCategory | "all";
  label: string;
  labelFa: string;
}

export const BLOG_CATEGORIES: BlogCategoryMeta[] = [
  { key: "all", label: "All Posts", labelFa: "همه مطالب" },
  { key: "my-blogs", label: "My Blogs", labelFa: "وبلاگ من" },
  { key: "news", label: "News", labelFa: "اخبار" },
];

export interface BlogAuthor {
  name: string;
  role: string;
  roleFa?: string;
  avatar: string;
  bio?: string;
}

export interface BlogSection {
  heading: string;
  headingFa?: string;
  body: string[];
  quote?: {
    text: string;
    caption?: string;
  };
  callout?: {
    title: string;
    text: string;
  };
  image?: {
    url: string;
    caption: string;
    alt: string;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  titleFa?: string;
  excerpt: string;
  excerptFa?: string;
  category: BlogCategory;
  categoryLabel: string;
  coverImage: string;
  publishedAt: string; // ISO format e.g. "2026-09-28"
  readTime: string;
  featured?: boolean;
  author: BlogAuthor;
  tags: string[];
  aiSummary: string[];
  sections: BlogSection[];
}

export const DEFAULT_AUTHOR: BlogAuthor = {
  name: "Siavash Akbari",
  role: "Photographer, Designer & Creative Director",
  avatar: "/og.jpg",
  bio: "Multidisciplinary designer and photographer based in Esfahan, focusing on minimal aesthetics, visual identity systems, and contemporary art direction.",
};

export const BLOG_POSTS: BlogPost[] = [
  // 1. My Blogs - Post 1 (Featured)
  {
    slug: "crafting-enduring-visual-identities",
    title: "Crafting Enduring Visual Identities in the Age of AI",
    titleFa: "خلق هویت‌های دیداری ماندگار در عصر هوش مصنوعی",
    excerpt:
      "Why authentic visual identity requires human editorial discernment, tactile intuition, and timeless architectural grids to stand out amidst generative saturation.",
    excerptFa:
      "چرا هویت دیداری اصیل به سلیقه انسانی، شهود لمسی و گرید معماری پایدار نیاز دارد تا در میان اشباع ابزارهای تولید محتوا بدرخشد.",
    category: "my-blogs",
    categoryLabel: "My Blogs",
    coverImage: imgBranding,
    publishedAt: "2026-09-26",
    readTime: "5 min read",
    featured: true,
    author: DEFAULT_AUTHOR,
    tags: ["Visual Identity", "Brand Strategy", "Art Direction", "Grid Systems"],
    aiSummary: [
      "Generative image models create infinite variations, making editorial discernment the primary differentiator for design studios.",
      "Enduring brand systems rely on mathematical proportional grids and deliberate constraints rather than superficial ornamentation.",
      "Studio workflows must treat AI synthesis as a high-velocity sketchbook, reserving final execution for vector precision and physical material fidelity.",
    ],
    sections: [
      {
        heading: "The Deluge of the Derivative",
        body: [
          "With the rapid democratization of generative tools, the barrier to producing visually competent imagery has dropped to near zero. A prompt containing a handful of adjectives can generate millions of pixels in seconds.",
          "Yet brand differentiation has never been harder to achieve. When software tools draw from the same common training corpus, visual culture homogenizes. In this climate of algorithmic mimicry, the role of the designer shifts from image maker to structural architect.",
        ],
        quote: {
          text: "When synthesis is free, discernment becomes the only luxury that cannot be counterfeited.",
          caption: "Siavash Akbari",
        },
      },
      {
        heading: "The Architectural Grid as Foundation",
        body: [
          "In our studio practice, every enduring identity begins with structural constraints. We look to early Swiss typography, Persian architectural geometry, and strict coordinate axes before any pixel is rendered.",
          "Mathematical systems give a brand its gravity. When generative tools are introduced into this framework, they operate within strict boundaries rather than dictating the structure.",
        ],
        callout: {
          title: "Studio Takeaway",
          text: "Use generative tools during discovery to explore concepts in minutes, but execute the core mark using vector precision and hand-tuned typography.",
        },
      },
    ],
  },

  // 2. My Blogs - Post 2
  {
    slug: "geometry-of-silence-minimalist-photography",
    title: "The Geometry of Silence: Minimalist Architectural Photography",
    titleFa: "هندسه سکوت: عکاسی مینیمال معماری و نور در فضاهای معاصر",
    excerpt:
      "Exploring negative space, chiaroscuro lighting, and volumetric proportion to strip visual storytelling down to its purest emotional essence.",
    excerptFa:
      "بررسی فضای منفی، کنتراست شدید نور و سایه و تناسبات حجمی برای تقلیل عکاسی تبلیغاتی به جوهره احساسی آن.",
    category: "my-blogs",
    categoryLabel: "My Blogs",
    coverImage: imgPhotography,
    publishedAt: "2026-09-20",
    readTime: "4 min read",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Photography", "Architecture", "Minimalism", "Chiaroscuro"],
    aiSummary: [
      "Minimalist architectural photography treats negative space as an active compositional force rather than empty void.",
      "High-contrast chiaroscuro lighting emphasizes geometric volumes and textures while removing unnecessary visual clutter.",
      "Restraint in color grading and post-production ensures optical longevity across print and digital media.",
    ],
    sections: [
      {
        heading: "Negative Space as Active Presence",
        body: [
          "In commercial photography, frames are often packed with narrative cues and props. In our editorial work, we operate in reverse: subtracting non-essential elements until only light, form, and silhouette remain.",
          "Negative space is not empty space; it is the atmospheric tension that gives the subject weight and visual breathing room.",
        ],
        quote: {
          text: "Composition is the art of deciding what to leave in darkness so the essential can emerge into clarity.",
          caption: "Photographic Notes",
        },
      },
      {
        heading: "The Chiaroscuro Method",
        body: [
          "Rather than washing a scene with multi-point diffused light, we frequently work with a single hard key light shaped through custom flags. This technique transforms objects and spaces into sculptural studies.",
        ],
      },
    ],
  },

  // 3. News - Post 1
  {
    slug: "studio-update-2026-design-award",
    title: "Studio Update: Siavash Akbari Studio Honored at Contemporary Design Awards 2026",
    titleFa: "اخبار استودیو: تقدیر از استودیو سیاوش اکبری در جوایز طراحی معاصر ۲۰۲۶",
    excerpt:
      "We are proud to announce our recent studio recognition for Excellence in Visual Identity Architecture and Cross-Cultural Design Systems.",
    excerptFa:
      "افتخار داریم اعلام کنیم استودیو سیاوش اکبری در جوایز طراحی معاصر ۲۰۲۶ برای برتری در معماری هویت دیداری و سیستم‌های چندفرهنگی مورد تقدیر قرار گرفت.",
    category: "news",
    categoryLabel: "News",
    coverImage: imgNews1,
    publishedAt: "2026-09-27",
    readTime: "3 min read",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Studio News", "Awards", "Recognition", "Visual Identity"],
    aiSummary: [
      "Siavash Akbari Studio received the 2026 Contemporary Design Recognition for excellence in bilingual brand architecture.",
      "The award highlights the studio's portfolio blending Swiss typographic rigor with Persian calligraphic heritage.",
      "The recognition included spatial signage and publication systems developed for architectural clients.",
    ],
    sections: [
      {
        heading: "Recognition for Cross-Disciplinary Craft",
        body: [
          "We are thrilled to share that Siavash Akbari Studio has been recognized at the 2026 Contemporary Design Awards for our ongoing work in visual identity design and brand architecture.",
          "The jury recognized our commitment to harmonizing Latin and Persian typographic systems within clean, minimal structural frameworks.",
        ],
        callout: {
          title: "Announcement",
          text: "Thank you to all our collaborators, clients, and partners who entrust us with shaping their visual voice and architectural presence.",
        },
      },
      {
        heading: "Looking Ahead to Upcoming Projects",
        body: [
          "This recognition reinforces our studio ethos: disciplined simplicity, tactile material consideration, and unwavering attention to typography and lighting.",
          "In the coming months, we will be unveiling new product design collaborations and bespoke spatial identity projects currently underway.",
        ],
      },
    ],
  },

  // 4. News - Post 2
  {
    slug: "exhibition-opening-contemporary-persian-forms",
    title: "Exhibition Opening: Contemporary Persian Form Studies in Tehran & Esfahan",
    titleFa: "افتتاح نمایشگاه: فرم‌های معاصر ایرانی در تهران و اصفهان",
    excerpt:
      "Announcing a dual-city gallery exhibition featuring our latest series of minimalist architectural prints, book covers, and object prototypes.",
    excerptFa:
      "اطلاعیه افتتاح نمایشگاه همزمان در تهران و اصفهان با نمایش آخرین آثار عکاسی مینیمال معماری، جلدهای کتاب و پروتوتایپ‌های محصولات معاصر.",
    category: "news",
    categoryLabel: "News",
    coverImage: imgNews2,
    publishedAt: "2026-09-15",
    readTime: "3 min read",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Exhibition", "Gallery", "Art", "Architecture", "Esfahan", "Tehran"],
    aiSummary: [
      "A curated exhibition of Siavash Akbari's photography, publication designs, and object studies is opening this season.",
      "The show takes place across partner galleries in Tehran and Esfahan.",
      "Features limited-edition archival silver-gelatin photographic prints and prototype textile-inspired objects.",
    ],
    sections: [
      {
        heading: "Dual-City Retrospective and Showcase",
        body: [
          "We are pleased to invite colleagues, clients, and design enthusiasts to 'Contemporary Form Studies'—an exhibition curated to explore the intersection of physical craft and contemporary visual restraint.",
          "The exhibition features over twenty archival large-format prints, original publication layouts, and prototype objects developed over the past four years.",
        ],
      },
      {
        heading: "Dates and Gallery Locations",
        body: [
          "Tehran: October 12 – October 26, 2026 at Modernist Arts Pavilion.",
          "Esfahan: November 5 – November 20, 2026 at Chaharbagh Contemporary Gallery.",
          "Admission is open to the public with advance RSVP for private curator walk-through sessions.",
        ],
        quote: {
          text: "Bringing physical prints and objects into tactile gallery space reminds us of the sensory gravity of real materials.",
          caption: "Exhibition Curatorial Statement",
        },
      },
    ],
  },

  // 5. Test/Profile Post - Siavash Akbari
  {
    slug: "siavash-akbari",
    title: "Siavash Akbari: Architectural Minimalism & Art Direction",
    titleFa: "سیاوش اکبری: مینیمالیسم معماری و مدیریت هنری",
    excerpt:
      "A personal reflection on the evolution of multidisciplinary studio practice in Esfahan, balancing commercial architectural photography, brand identity, and experimental print projects.",
    excerptFa:
      "تأملی بر مسیر استودیو و تلفیق عکاسی معماری، دیزاین هویت بصری و پروژه‌های تجربی در اصفهان.",
    category: "my-blogs",
    categoryLabel: "My Blogs",
    coverImage: imgPhotography,
    publishedAt: "2026-09-28",
    readTime: "4 min read",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Siavash Akbari", "Architecture", "Art Direction", "Minimalism", "Esfahan"],
    aiSummary: [
      "Siavash Akbari is an Iranian photographer, art director, and visual identity designer based in Esfahan.",
      "The studio works at the intersection of Swiss modernist grid structures, Persian architectural geometry, and minimalist photography.",
      "Commercial commissions span fashion campaigns, brand identity design, and architectural documentation.",
    ],
    sections: [
      {
        heading: "Foundations & Philosophy",
        body: [
          "Operating as a multidisciplinary designer and photographer in Esfahan means constantly dialoguing with architectural history and spatial rhythm. The ancient geometric proportions of Islamic and Persian architecture continue to inform how we construct grids in contemporary brand systems.",
          "Our philosophy is grounded in disciplined restraint: removing ornamentation until only form, texture, and light remain to tell the story.",
        ],
        quote: {
          text: "Design is not about adding layers; it is about reaching a point where nothing more can be removed without losing the soul.",
          caption: "Siavash Akbari",
        },
      },
      {
        heading: "Crafting Across Disciplines",
        body: [
          "Whether developing a bilingual identity system for an architectural practice or capturing chiaroscuro shadows across a concrete façade, the approach remains unified.",
          "Light behaves as an architect, and typography functions as spatial construction.",
        ],
        callout: {
          title: "Creative Focus",
          text: "Minimalist aesthetics, high-contrast chiaroscuro lighting, and enduring grid-based bilingual typography.",
        },
      },
    ],
  },
];


