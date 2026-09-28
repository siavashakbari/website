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
  { key: "news", label: "News", labelFa: "اخبار استودیو" },
];

export interface BlogAuthor {
  name: string;
  nameFa: string;
  role: string;
  roleFa: string;
  avatar: string;
  bio: string;
  bioFa: string;
}

export interface BlogSection {
  heading: string;
  headingFa: string;
  body: string[];
  bodyFa: string[];
  quote?: {
    text: string;
    textFa: string;
    caption?: string;
    captionFa?: string;
  };
  callout?: {
    title: string;
    titleFa: string;
    text: string;
    textFa: string;
  };
  image?: {
    url: string;
    caption: string;
    captionFa?: string;
    alt: string;
    altFa?: string;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  titleFa: string;
  excerpt: string;
  excerptFa: string;
  category: BlogCategory;
  categoryLabel: string;
  categoryLabelFa: string;
  coverImage: string;
  publishedAt: string; // ISO format e.g. "2026-09-28"
  readTime: string;
  readTimeFa: string;
  featured?: boolean;
  author: BlogAuthor;
  tags: string[];
  tagsFa: string[];
  aiSummary: string[];
  aiSummaryFa: string[];
  sections: BlogSection[];
}

export const DEFAULT_AUTHOR: BlogAuthor = {
  name: "Siavash Akbari",
  nameFa: "سیاوش اکبری",
  role: "Photographer, Designer & Creative Director",
  roleFa: "عکاس، طراح گرافیک و مدیر هنری",
  avatar: "/og.jpg",
  bio: "Multidisciplinary designer and photographer based in Esfahan, focusing on minimal aesthetics, visual identity systems, and contemporary art direction.",
  bioFa:
    "طراح و عکاس بین‌رشته‌ای در اصفهان با تمرکز بر زیبایی‌شناسی مینیمال، سیستم‌های هویت دیداری و کارگردانی هنری معاصر.",
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
    categoryLabelFa: "وبلاگ من",
    coverImage: imgBranding,
    publishedAt: "2026-09-26",
    readTime: "5 min read",
    readTimeFa: "۵ دقیقه مطالعه",
    featured: true,
    author: DEFAULT_AUTHOR,
    tags: ["Visual Identity", "Brand Strategy", "Art Direction", "Grid Systems"],
    tagsFa: ["هویت دیداری", "استراتژی برند", "کارگردانی هنری", "سیستم‌های گرید"],
    aiSummary: [
      "Generative image models create infinite variations, making editorial discernment the primary differentiator for design studios.",
      "Enduring brand systems rely on mathematical proportional grids and deliberate constraints rather than superficial ornamentation.",
      "Studio workflows must treat AI synthesis as a high-velocity sketchbook, reserving final execution for vector precision and physical material fidelity.",
    ],
    aiSummaryFa: [
      "مدل‌های زاینده بی‌نهایت تنوع بصری ایجاد می‌کنند؛ از این رو سلیقه و ویرایش انسانی به عامل اصلی تمایز استودیوهای طراحی تبدیل شده است.",
      "سیستم‌های برند ماندگار به جای تزیینات سطحی، بر پایه‌ی نسبت‌های ریاضی، خطوط گرید و محدودیت‌های هدفمند بنا می‌شوند.",
      "فرآیند استودیویی باید هوش مصنوعی را به مثابه دفترچه اتود پرسرعت به کار گیرد و اجرای نهایی را به دقت برداری و کیفیت فیزیکی مواد بسپارد.",
    ],
    sections: [
      {
        heading: "The Deluge of the Derivative",
        headingFa: "طوفان طرح‌های تکراری و مشتق",
        body: [
          "With the rapid democratization of generative tools, the barrier to producing visually competent imagery has dropped to near zero. A prompt containing a handful of adjectives can generate millions of pixels in seconds.",
          "Yet brand differentiation has never been harder to achieve. When software tools draw from the same common training corpus, visual culture homogenizes. In this climate of algorithmic mimicry, the role of the designer shifts from image maker to structural architect.",
        ],
        bodyFa: [
          "با گسترش سریع ابزارهای هوش مصنوعی زاینده، مانعِ ورود به خلق تصاویر از نظر فنی به صفر رسیده است. یک پرامپت با چند صفت می‌تواند در چند ثانیه میلیون‌ها پیکسل تولید کند.",
          "با این حال، دستیابی به تمایز واقعی برند هرگز دشوارتر از امروز نبوده است. وقتی ابزارها همگی از یک پایگاه داده مشترک تغذیه می‌کنند، فرهنگ بصری دچار یکدستی و تکرار می‌شود. در این فضا، نقش طراح از یک تصویرساز به یک معمار ساختاری تغییر می‌کند.",
        ],
        quote: {
          text: "When synthesis is free, discernment becomes the only luxury that cannot be counterfeited.",
          textFa:
            "وقتی تولید تصویر رایگان است، سلیقه و گزینش تنها کیفیتی است که نمی‌توان آن را جعل کرد.",
          caption: "Siavash Akbari",
          captionFa: "سیاوش اکبری",
        },
      },
      {
        heading: "The Architectural Grid as Foundation",
        headingFa: "گرید معماری به مثابه شالوده اصیل",
        body: [
          "In our studio practice, every enduring identity begins with structural constraints. We look to early Swiss typography, Persian architectural geometry, and strict coordinate axes before any pixel is rendered.",
          "Mathematical systems give a brand its gravity. When generative tools are introduced into this framework, they operate within strict boundaries rather than dictating the structure.",
        ],
        bodyFa: [
          "در رویه کاری استودیو ما، هر هویت بصری پایدار با محدودیت‌های ساختاری آغاز می‌شود. پیش از ایجاد هر پیکسلی، به تایپوگرافی سوئیسی، هندسه معماری ایرانی و محورهای مختصات نگاه می‌کنیم.",
          "سیستم‌های ریاضیاتی به برند وزن و ماندگاری می‌بخشند. هنگامی که ابزارهای زاینده به این چارچوب وارد می‌شوند، درون مرزهای مشخص عمل می‌کنند نه آنکه ساختار کلی را تحمیل کنند.",
        ],
        callout: {
          title: "Studio Takeaway",
          titleFa: "نتیجه‌گیری استودیو",
          text: "Use generative tools during discovery to explore concepts in minutes, but execute the core mark using vector precision and hand-tuned typography.",
          textFa:
            "در فاز ایده پردازی از هوش مصنوعی برای کشف زوایای مختلف ایده در چند دقیقه استفاده کنید، اما نشان اصلی را با دقت برداری و تایپوگرافی دست‌ساز خلق نمایید.",
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
    categoryLabelFa: "وبلاگ من",
    coverImage: imgPhotography,
    publishedAt: "2026-09-20",
    readTime: "4 min read",
    readTimeFa: "۴ دقیقه مطالعه",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Photography", "Architecture", "Minimalism", "Chiaroscuro"],
    tagsFa: ["عکاسی", "معماری", "مینیمالیسم", "سایه و نور"],
    aiSummary: [
      "Minimalist architectural photography treats negative space as an active compositional force rather than empty void.",
      "High-contrast chiaroscuro lighting emphasizes geometric volumes and textures while removing unnecessary visual clutter.",
      "Restraint in color grading and post-production ensures optical longevity across print and digital media.",
    ],
    aiSummaryFa: [
      "عکاسی مینیمال معماری با فضای منفی به عنوان یک نیروی زنده و هدایت‌کننده کادر برخورد می‌کند نه خلأ بی‌خاصیت.",
      "نورپردازی پرکنتراست کیاروسکورو بر احجام هندسی و بافت متریال‌ها تأکید کرده و شلوغی‌های اضافه را از صحنه حذف می‌کند.",
      "خویشتن‌داری در اصلاح رنگ و ادیت عکس، ماندگاری بصری تصاویر را در گذر زمان تضمین می‌کند.",
    ],
    sections: [
      {
        heading: "Negative Space as Active Presence",
        headingFa: "فضای منفی به مثابه حضوری زنده",
        body: [
          "In commercial photography, frames are often packed with narrative cues and props. In our editorial work, we operate in reverse: subtracting non-essential elements until only light, form, and silhouette remain.",
          "Negative space is not empty space; it is the atmospheric tension that gives the subject weight and visual breathing room.",
        ],
        bodyFa: [
          "در عکاسی تبلیغاتی مرسوم، کادرها پر از المان‌ها و آکسسوارات جانبی می‌شوند. در رویکرد استودیویی ما، جهت عکس حاکم است: کسر کردن عناصر غیرضروری تا جایی که تنها نور، فرم و سایه باقی بماند.",
          "فضای منفی، فضای خالی نیست؛ بلکه تنفس و کشش اتمسفری است که به سوژه اصلی وزن و صلابت بصری می‌بخشد.",
        ],
        quote: {
          text: "Composition is the art of deciding what to leave in darkness so the essential can emerge into clarity.",
          textFa:
            "ترکیب‌بندی یعنی هنر تصمیم‌گیری در مورد آنچه باید در تاریکی بماند تا گوهر اصلی روشن و نمایان شود.",
          caption: "Photographic Notes",
          captionFa: "یادداشت‌های عکاسی استودیو",
        },
      },
      {
        heading: "The Chiaroscuro Method",
        headingFa: "تکنیک کیاروسکورو در فضا",
        body: [
          "Rather than washing a scene with multi-point diffused light, we frequently work with a single hard key light shaped through custom flags. This technique transforms objects and spaces into sculptural studies.",
        ],
        bodyFa: [
          "به جای پر کردن فضا با نورهای پراکنده متعدد، ترجیح می‌دهیم با یک نور تند جهت‌دار به همراه شیدرها و بازتابنده‌های کنترل‌شده کار کنیم تا اشیاء و حجم‌ها کیفیتی مجسمه‌گونه پیدا کنند.",
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
    categoryLabelFa: "اخبار استودیو",
    coverImage: imgNews1,
    publishedAt: "2026-09-27",
    readTime: "3 min read",
    readTimeFa: "۳ دقیقه مطالعه",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Studio News", "Awards", "Recognition", "Visual Identity"],
    tagsFa: ["اخبار استودیو", "جوایز", "افتخارات", "هویت دیداری"],
    aiSummary: [
      "Siavash Akbari Studio received the 2026 Contemporary Design Recognition for excellence in bilingual brand architecture.",
      "The award highlights the studio's portfolio blending Swiss typographic rigor with Persian calligraphic heritage.",
      "The recognition included spatial signage and publication systems developed for architectural clients.",
    ],
    aiSummaryFa: [
      "استودیو سیاوش اکبری در مراسم جوایز طراحی معاصر ۲۰۲۶ به دلیل برتری در معماری هویت دوزبانه مورد تقدیر قرار گرفت.",
      "این جایزه بر پیوند میان انضباط تایپوگرافی سوئیسی و میراث خوشنویسی ایرانی در آثار استودیو تأکید دارد.",
      "پروژه‌های برگزیده شامل سیستم‌های هویت محیطی و نشریات معماری طراحی‌شده برای پروژه‌های ساختمانی بوده‌اند.",
    ],
    sections: [
      {
        heading: "Recognition for Cross-Disciplinary Craft",
        headingFa: "قدردانی از تلفیق تخصص‌های میان‌رشته‌ای",
        body: [
          "We are thrilled to share that Siavash Akbari Studio has been recognized at the 2026 Contemporary Design Awards for our ongoing work in visual identity design and brand architecture.",
          "The jury recognized our commitment to harmonizing Latin and Persian typographic systems within clean, minimal structural frameworks.",
        ],
        bodyFa: [
          "با خرسندی اعلام می‌کنیم که استودیو سیاوش اکبری در جوایز طراحی معاصر ۲۰۲۶ برای مجموعه پروژه‌های هویت دیداری و معماری برند مورد تقدیر قرار گرفته است.",
          "هیئت داوران توجه ویژه استودیو به همگام‌سازی سیستم‌های تایپوگرافی فارسی و لاتین در قالب بسترهای مینیمال و دقیق را شایسته تحسین دانستند.",
        ],
        callout: {
          title: "Announcement",
          titleFa: "اطلاعیه استودیو",
          text: "Thank you to all our collaborators, clients, and partners who entrust us with shaping their visual voice and architectural presence.",
          textFa:
            "از تمام همکاران، کارفرمایان و دوستانی که ساختن هویت بصری و صدای برندشان را به ما سپردند صمیمانه سپاسگزاریم.",
        },
      },
      {
        heading: "Looking Ahead to Upcoming Projects",
        headingFa: "چشم‌انداز پروژه‌های آتی",
        body: [
          "This recognition reinforces our studio ethos: disciplined simplicity, tactile material consideration, and unwavering attention to typography and lighting.",
          "In the coming months, we will be unveiling new product design collaborations and bespoke spatial identity projects currently underway.",
        ],
        bodyFa: [
          "این دستاورد بر رویکرد همیشگی استودیو مهر تأیید می‌زند: سادگی دقیق، توجه به ماهیت مادی اثر و وسواس بر سر تایپوگرافی و نور.",
          "در ماه‌های آینده، از همکاری‌های جدید در زمینه طراحی اشیاء و هویت‌های محیطی و معماری رونمایی خواهیم کرد.",
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
    categoryLabelFa: "اخبار استودیو",
    coverImage: imgNews2,
    publishedAt: "2026-09-15",
    readTime: "3 min read",
    readTimeFa: "۳ دقیقه مطالعه",
    featured: false,
    author: DEFAULT_AUTHOR,
    tags: ["Exhibition", "Gallery", "Art", "Architecture", "Esfahan", "Tehran"],
    tagsFa: ["نمایشگاه", "گالری", "هنر معاصر", "معماری", "اصفهان", "تهران"],
    aiSummary: [
      "A curated exhibition of Siavash Akbari's photography, publication designs, and object studies is opening this season.",
      "The show takes place across partner galleries in Tehran and Esfahan.",
      "Features limited-edition archival silver-gelatin photographic prints and prototype textile-inspired objects.",
    ],
    aiSummaryFa: [
      "نمایشگاهی گزیده از عکاسی، جلدهای کتاب و مطالعات فرمی اشیاء سیاوش اکبری در پاییز پیش‌رو برگزار خواهد شد.",
      "این رویداد به صورت مشترک در گالری‌های همکار در تهران و اصفهان برگزار می‌شود.",
      "آثار شامل نسخه‌های چاپی آرشیوی محدود و نمونه‌های اولیه اشیاء ملهم از دستبافته‌های ایرانی است.",
    ],
    sections: [
      {
        heading: "Dual-City Retrospective and Showcase",
        headingFa: "نمایش دوگانه آثار در دو شهر",
        body: [
          "We are pleased to invite colleagues, clients, and design enthusiasts to 'Contemporary Form Studies'—an exhibition curated to explore the intersection of physical craft and contemporary visual restraint.",
          "The exhibition features over twenty archival large-format prints, original publication layouts, and prototype objects developed over the past four years.",
        ],
        bodyFa: [
          "از تمام هنرمندان، طراحان و علاقه‌مندان دعوت می‌کنیم در نمایشگاه «مطالعات فرم معاصر» حضور به هم رسانند؛ رویدادی برای بررسی تلاقی صنایع دستی سنتی با سادگی بصری مدرن.",
          "در این نمایشگاه بیش از بیست قطعه چاپ عکس در ابعاد بزرگ، لی‌اوت‌های اصلی کتب و پروتوتایپ‌های محصولات چهار سال گذشته به نمایش درمی‌آید.",
        ],
      },
      {
        heading: "Dates and Gallery Locations",
        headingFa: "زمان‌بندی و نشانی گالری‌ها",
        body: [
          "Tehran: October 12 – October 26, 2026 at Modernist Arts Pavilion.",
          "Esfahan: November 5 – November 20, 2026 at Chaharbagh Contemporary Gallery.",
          "Admission is open to the public with advance RSVP for private curator walk-through sessions.",
        ],
        bodyFa: [
          "تهران: ۲۱ مهر تا ۵ آبان ۱۴۰۵ در گالری کوشک هنر معاصر.",
          "اصفهان: ۱۵ تا ۳۰ آبان ۱۴۰۵ در نگارخانه معاصر چهارباغ.",
          "بازدید برای عموم آزاد است و جهت حضور در جلسات نقد اختصاصی کیوریتور نیاز به ثبت‌نام قبلی می‌باشد.",
        ],
        quote: {
          text: "Bringing physical prints and objects into tactile gallery space reminds us of the sensory gravity of real materials.",
          textFa:
            "آوردن چاپ‌ها و اشیاء فیزیکی به فضای گالری، اهمیت و وزن حسی متریال‌های واقعی را به ما یادآوری می‌کند.",
          caption: "Exhibition Curatorial Statement",
          captionFa: "بیانیه کیوریتوریال نمایشگاه",
        },
      },
    ],
  },
];
