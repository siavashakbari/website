// Analytics & GA4 Tracking Helper for Siavash Akbari Studio
import type { VisualAsset, ProjectCaseStudy } from "@/types/portfolio-schema";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Tracks individual visual asset views in GA4 with custom dimensions.
 */
export const trackPortfolioAssetView = (
  asset: VisualAsset,
  project?: ProjectCaseStudy,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  const clientCredit =
    asset.credits.find((c) => c.role.toLowerCase().includes("client"))?.name ||
    project?.clientName ||
    "Independent / Studio";

  window.gtag("event", "view_portfolio_asset", {
    content_group: asset.discipline,
    asset_code: asset.assetCode,
    asset_title: asset.title,
    project_name: project?.title || asset.projectCode,
    sub_discipline: asset.subDisciplines.join(", "),
    client_name: clientCredit,
    asset_year: String(asset.year),
    media_type: asset.mediaType,
  });
};

/**
 * Tracks credit clicks to evaluate engagement with collaborators / talent.
 */
export const trackCreditClick = (
  role: string,
  personName: string,
  assetCode: string,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "click_asset_credit", {
    credit_role: role,
    credit_name: personName,
    asset_code: assetCode,
  });
};

/**
 * Tracks inquiries or commission actions launched from an asset.
 */
export const trackCommissionInquiryFromAsset = (
  assetCode: string,
  discipline: string,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "generate_lead_from_asset", {
    asset_code: assetCode,
    content_group: discipline,
  });
};
