// Siavash Akbari Studio — Digital Asset Management (DAM), URL Taxonomy, Admin Schema & SEO/GA4 Specification Types

export type DisciplineSlug =
  | "fashion-photography"
  | "food-photography"
  | "portrait-photography"
  | "product-photography"
  | "visual-identity"
  | "book-covers"
  | "posters"
  | "videos"
  | "graphic-design";

export type DisciplineCode =
  | "FASH"
  | "FOOD"
  | "PORT"
  | "PROD"
  | "VIDN"
  | "BOOK"
  | "POST"
  | "VIDO"
  | "DSGN";

export interface CreditEntry {
  role: string;          // e.g., "Client", "Model", "Makeup Artist", "Publisher", "Author"
  name: string;          // e.g., "Atlasi", "Tarlan Eshtiagh", "Nozad Publications"
  url?: string;          // Optional external or internal link
}

export interface ProjectCaseStudy {
  id: string;                        // e.g., "proj_atlasi"
  projectCode: string;               // 3-char uppercase code: "ATL"
  title: string;                     // e.g., "Atlasi"
  titleFa?: string;
  slug: string;                      // e.g., "atlasi"
  discipline: DisciplineSlug;        // e.g., "fashion-photography"
  year: number | string;             // e.g., 2024
  clientName?: string;               // e.g., "Atlasi"
  clientIndustry?: string;           // e.g., "Contemporary Fashion & Hand-Woven Textiles"
  shortSummary?: string;             // 1-2 sentence hook used in cards and meta description
  editorialStory?: string;           // Rich description for Case Study page
  defaultSubDisciplines: string[];   // Inherited by child assets unless overridden
  defaultCredits: CreditEntry[];     // Inherited by child assets unless overridden
  featured: boolean;
  sortOrder: number;
}

export interface VisualAsset {
  // 1. Identity & Routing
  id: string;                        // UUID or immutable key
  assetCode: string;                 // Standardized formula: "SA-FASH-ATL-01"
  discipline: DisciplineSlug;        // "fashion-photography"
  disciplineCode: DisciplineCode;    // "FASH"
  projectId: string;                 // Foreign key -> ProjectCaseStudy.id ("proj_atlasi")
  projectCode: string;               // "ATL"
  sequenceNumber: number;            // 1 -> formatted as "01"
  seoSlug: string;                   // Auto-generated or custom: "atlasi-editorial-01"
  canonicalPath: string;             // "/fashion-photography/atlasi-editorial-01"
  legacyCodePath: string;            // "/fashion-photography/SA-FASH-ATL-01"

  // 2. Display & Categorization
  title: string;                     // Display title: "Atlasi — 01" or custom title
  subDisciplines: string[];          // Array of specialties: ["Editorial", "Textiles & Fabric"]
  year: number | string;             // 2024
  datePublished?: string;            // ISO 8601 "2024-05-14"

  // 3. Credits (Inherits from Project + Asset-level overrides)
  inheritProjectCredits: boolean;    // If true, merges project defaultCredits with asset credits
  credits: CreditEntry[];            // Structured array of { role, name, url }

  // 4. Media & Technical Metadata
  mediaType: "image" | "video";
  srcUrl: string;                    // WebP/AVIF or MP4 URL
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  aspectRatio?: "portrait" | "landscape" | "square" | "cinematic";
  dominantColorHex?: string;

  // 5. SEO & Accessibility (Auto-computed with Manual Override toggle)
  altText: string;                   // Auto-generated rich alt text
  metaTitle: string;                 // "<Title> — <SubDiscipline> | Siavash Akbari"
  metaDescription: string;           // 150-160 char rich description
  keywords: string[];                // ["Atlasi", "Fashion Photography", "Editorial", "Siavash Akbari"]

  // 6. Status & Ordering
  status: "published" | "draft" | "archived";
  featuredInDiscipline: boolean;
  sortOrder: number;
  updatedAt: string;
}

// Map discipline slug to 4-char DisciplineCode
export const DISCIPLINE_CODE_MAP: Record<string, DisciplineCode> = {
  "fashion-photography": "FASH",
  "food-photography": "FOOD",
  "portrait-photography": "PORT",
  "product-photography": "PROD",
  "visual-identity": "VIDN",
  "book-covers": "BOOK",
  "posters": "POST",
  "videos": "VIDO",
  "video": "VIDO",
  "graphic-design": "DSGN",
};

// Filtered quick-tags per discipline matrix
export const DISCIPLINE_QUICK_TAGS: Record<string, string[]> = {
  "fashion-photography": [
    "Editorial",
    "Lookbook",
    "Campaign",
    "Silhouette & Posture",
    "Streetwear",
    "Haute Couture & Heritage",
    "Studio Minimal",
    "Textiles & Fabric",
    "Accessories & Jewelry",
  ],
  "food-photography": [
    "Fine Dining & Plating",
    "Beverage & Mixology",
    "Artisanal & Bakery",
    "Packaging & Ingredients",
    "Dark & Moody",
    "High-Key Commercial",
    "Hospitality & Interior",
  ],
  "portrait-photography": [
    "Artistic / Conceptual",
    "Editorial Portrait",
    "Environmental Portrait",
    "Chiaroscuro & Studio",
    "Monochrome",
    "Calligraphy & Mixed Media",
    "Headshot & Personal Brand",
  ],
  "product-photography": [
    "Furniture",
    "Ceramics & Tableware",
    "Lighting & Lamps",
    "Plants & Botanicals",
    "Cosmetics & Skincare",
    "Tech & Industrial",
    "Textiles & Home",
    "Architectural Objects",
  ],
  "visual-identity": [
    "Identity System",
    "Wordmark",
    "Monogram & Symbol",
    "Packaging",
    "Brand Guidelines",
    "Editorial & Print Collateral",
    "Pattern Language",
    "Signage & Wayfinding",
    "Digital & UI System",
  ],
  "book-covers": [
    "Literary Fiction",
    "Philosophy & Essays",
    "Art & Architecture Monograph",
    "Poetry",
    "Typography-Led Cover",
    "Illustrated / Collage Cover",
  ],
  "posters": [
    "Cultural & Exhibition",
    "Typography & Grid",
    "Music & Performance",
    "Cinema & Theater",
    "Experimental / Conceptual",
    "Event Identity",
  ],
  "videos": [
    "Brand Film",
    "Fashion Film",
    "Product Commercial",
    "Motion Sequence",
    "Title Design & Logo Motion",
    "Documentary Short",
  ],
  "video": [
    "Brand Film",
    "Fashion Film",
    "Product Commercial",
    "Motion Sequence",
    "Title Design & Logo Motion",
    "Documentary Short",
  ],
  "graphic-design": [
    "Identity System",
    "Packaging",
    "Editorial & Print Collateral",
    "Cultural & Exhibition",
    "Typography & Grid",
  ],
};

// Pinned primary credit roles per discipline
export interface DisciplineRoleDefinition {
  primary: string[];
  secondary: string[];
}

export const DISCIPLINE_ROLE_MATRIX: Record<string, DisciplineRoleDefinition> = {
  "fashion-photography": {
    primary: ["Client / Brand", "Model(s)", "Stylist / Wardrobe", "Makeup Artist (MUA)", "Lighting / Photo Assistant"],
    secondary: ["Art Director", "Hair Stylist", "Set Designer", "Location"],
  },
  "food-photography": {
    primary: ["Client / Restaurant", "Chef / Culinary Artist", "Food Stylist", "Prop Stylist", "Photo Assistant"],
    secondary: ["Art Director", "Ceramics / Tableware By"],
  },
  "portrait-photography": {
    primary: ["Subject / Sitter(s)", "Client / Publication", "Makeup Artist (MUA)", "Calligrapher / Collaborator", "Assistant"],
    secondary: ["Stylist", "Lighting Tech"],
  },
  "product-photography": {
    primary: ["Client / Brand", "Product / Industrial Designer", "Set / Prop Stylist", "Photo Assistant"],
    secondary: ["Art Director", "Material / Craft Studio"],
  },
  "visual-identity": {
    primary: ["Client / Brand", "Creative / Art Director", "Brand Designer", "Motion Designer", "Typeface(s) Used"],
    secondary: ["Packaging Engineer", "Copywriter", "3D Artist", "Client Industry"],
  },
  "book-covers": {
    primary: ["Publisher", "Book Title", "Author", "Translator", "Art Director / Designer"],
    secondary: ["Calligrapher", "Illustrator", "Print Specifications (Format/Paper)"],
  },
  "posters": {
    primary: ["Client / Cultural Institution", "Event / Exhibition Title", "Art Director / Designer", "Typographer / Calligrapher"],
    secondary: ["Curator", "Print Method / Dimensions"],
  },
  "videos": {
    primary: ["Client / Brand", "Director", "Director of Photography (DOP)", "Editor", "Colorist", "Sound / Music"],
    secondary: ["Motion Designer", "Producer", "Gaffer", "Talent / Cast"],
  },
  "video": {
    primary: ["Client / Brand", "Director", "Director of Photography (DOP)", "Editor", "Colorist", "Sound / Music"],
    secondary: ["Motion Designer", "Producer", "Gaffer", "Talent / Cast"],
  },
  "graphic-design": {
    primary: ["Client / Brand", "Creative / Art Director", "Designer", "Typographer"],
    secondary: ["Copywriter", "Print Studio"],
  },
};
