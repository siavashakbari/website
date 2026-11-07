import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId, useRouter, redirect } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Tag, ExternalLink } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { getPhotoItemBySlugOrCode, getStudioProjects } from "@/lib/studio-store";
import {
  getPhotoByCode,
  getPhotoBySeoSlug,
  getPhotoByStem,
  computeItemSeoSlug,
  PHOTO_INVENTORY,
  type PhotoInventoryItem,
} from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead, jsonLdScript, visualAssetJsonLd, absoluteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import { trackPortfolioAssetView, trackCreditClick, trackCommissionInquiryFromAsset } from "@/lib/analytics";
import type { VisualAsset } from "@/types/portfolio-schema";

export const Route = createFileRoute("/$discipline/$photoId")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound({ routeId: rootRouteId });

    const rawParam = params.photoId.trim();

    // 1. Primary lookup: by slug or code in studio store or PHOTO_INVENTORY
    let photo: PhotoInventoryItem | undefined =
      getPhotoItemBySlugOrCode(rawParam, discipline.slug) ||
      getPhotoBySeoSlug(rawParam, discipline.slug) ||
      getPhotoByCode(rawParam);

    // 2. Fallback: by stem
    if (!photo) {
      photo = getPhotoByStem(rawParam);
    }

    // 3. Fallback: case-insensitive code or filename search in inventory
    if (!photo) {
      const q = rawParam.toLowerCase();
      photo = PHOTO_INVENTORY.find(
        (i) =>
          i.code.toLowerCase() === q ||
          i.imgSrc.toLowerCase().includes(q)
      );
    }

    // 4. Fallback: if it was a project-based code like "gastronomie-01"
    if (!photo) {
      const match = rawParam.match(/^(.*)-(\d+)$/);
      if (match) {
        const [, projId, idxStr] = match;
        const proj = projects.find((p) => p.id === projId);
        if (proj) {
          const idx = parseInt(idxStr, 10) - 1;
          const gallery = proj.gallery ?? [proj.image];
          const src = gallery[idx] || proj.image;
          const stem = src.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
          photo = getPhotoByStem(stem) || {
            code: rawParam.toUpperCase(),
            project: proj.title,
            discipline: discipline.label,
            disciplineSlug: discipline.slug,
            imgSrc: src,
            subdiscipline: proj.subDiscipline || proj.category || "",
            model: Array.isArray(proj.models) ? proj.models.join(", ") : (proj.models || ""),
            client: proj.client || "",
            makeupArtist: proj.makeupArtist || "",
            assistant: proj.assistant || "",
            date: proj.year || "2024",
            keywords: `${proj.title}, ${discipline.label}, Siavash Akbari`,
            caption: proj.caption || proj.description || "",
          };
        }
      }
    }

    if (!photo) {
      throw notFound({ routeId: rootRouteId });
    }

    // Check project inheritance: if parent project has client or credits, inherit them
    const studioProjects = getStudioProjects();
    const parentProject =
      studioProjects.find((p) => p.title.toLowerCase() === photo?.project.toLowerCase()) ||
      projects.find((p) => p.title.toLowerCase() === photo?.project.toLowerCase());

    const client = photo.client || parentProject?.client || "";
    const model = photo.model || (parentProject ? (Array.isArray(parentProject.models) ? parentProject.models.join(", ") : parentProject.models) : "") || "";
    const makeupArtist = photo.makeupArtist || parentProject?.makeupArtist || "";
    const assistant = photo.assistant || parentProject?.assistant || "";
    const year = photo.date || parentProject?.year || "2024";

    const resolvedPhoto: PhotoInventoryItem = {
      ...photo,
      client,
      model,
      makeupArtist,
      assistant,
      date: String(year),
    };

    // Calculate Canonical SEO Slug
    const canonicalSlug = resolvedPhoto.seoSlug || computeItemSeoSlug(resolvedPhoto);
    const isDirectCodeAccess = rawParam.toUpperCase() === resolvedPhoto.code.toUpperCase();

    // 301 Permanent Redirect rule: If accessed via raw UPPERCASE legacy SKU code (e.g. SA-FASH-ATL-01),
    // redirect to the semantic lowercase SEO slug so search engines consolidate index authority
    if (isDirectCodeAccess && canonicalSlug && rawParam !== canonicalSlug) {
      throw redirect({
        to: "/$discipline/$photoId",
        params: { discipline: discipline.slug, photoId: canonicalSlug },
        statusCode: 301,
      });
    }

    const resolvedImage = resolveInventoryImage(resolvedPhoto.imgSrc);

    // Strip non-serializable functions (e.g. discipline.match) to prevent Seroval SSR serialization failure
    const serializableDiscipline = {
      slug: discipline.slug,
      label: discipline.label,
      blurb: discipline.blurb,
    };

    return {
      discipline: serializableDiscipline,
      photo: resolvedPhoto,
      canonicalSlug,
      resolvedImage,
      parentProjectTitle: parentProject?.title,
    };
  },
  head: ({ loaderData }) => {
    const photo = loaderData?.photo;
    const discipline = loaderData?.discipline;
    const canonicalSlug = loaderData?.canonicalSlug;
    const seqMatch = photo?.code.match(/(\d+)$/);
    const seq = seqMatch ? seqMatch[1] : "01";

    // Section 6.1: Dynamic Metadata Formula
    // Title: {Project Title} ({Sequence}) — {Sub-Discipline} & {Discipline} | Siavash Akbari
    const subPart = photo?.subdiscipline ? `${photo.subdiscipline} & ` : "";
    const title = photo
      ? `${photo.project} (${seq}) — ${subPart}${photo.discipline} | Siavash Akbari`
      : "Photography — Siavash Akbari";

    // Meta Description Formula:
    // Explore {Project Title} ({Asset Code}), a {Year} {Sub-Discipline} {Discipline} work by multidisciplinary creative director Siavash Akbari...
    const clientSnippet = photo?.client ? ` for ${photo.client}` : "";
    const creditsList = [photo?.model && `Model: ${photo.model}`, photo?.makeupArtist && `MUA: ${photo.makeupArtist}`]
      .filter(Boolean)
      .join(", ");
    const creditsSnippet = creditsList ? ` Credits: ${creditsList}.` : "";
    const description =
      photo?.caption ||
      `Explore ${photo?.project} (${photo?.code}), a ${photo?.date || "2024"} ${photo?.subdiscipline || ""} ${photo?.discipline} work by multidisciplinary creative director Siavash Akbari${clientSnippet}.${creditsSnippet}`.slice(0, 160);

    const slug = discipline?.slug ?? "photography";
    const canonicalPath = `/${slug}/${canonicalSlug || photo?.code?.toLowerCase()}`;

    const seo = pageHead({
      title,
      description,
      path: canonicalPath,
      image: loaderData?.resolvedImage,
      type: "article",
    });

    // Structured Data (JSON-LD Schema.org) graph with ImageObject + VisualArtwork + BreadcrumbList
    const structuredData = photo
      ? visualAssetJsonLd({
          assetCode: photo.code,
          title: `${photo.project} — ${photo.code}`,
          discipline: photo.discipline,
          disciplineSlug: slug,
          projectTitle: photo.project,
          seoSlug: canonicalSlug || photo.code.toLowerCase(),
          canonicalUrl: canonicalPath,
          imageUrl: loaderData?.resolvedImage || photo.imgSrc,
          year: photo.date || "2024",
          subDiscipline: photo.subdiscipline,
          client: photo.client,
          credits: [
            photo.model ? { role: "Model", name: photo.model } : null,
            photo.makeupArtist ? { role: "Makeup Artist", name: photo.makeupArtist } : null,
            photo.assistant ? { role: "Assistant", name: photo.assistant } : null,
          ].filter(Boolean) as { role: string; name: string }[],
          description,
          keywords: photo.keywords ? photo.keywords.split(",").map((k) => k.trim()) : undefined,
          mediaType: "image",
        })
      : null;

    return {
      ...seo,
      scripts: structuredData ? [jsonLdScript(structuredData)] : [],
    };
  },
  component: DedicatedPhotoPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Photo Not Found</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function DedicatedPhotoPage() {
  const { discipline, photo, canonicalSlug, resolvedImage, parentProjectTitle } = Route.useLoaderData();
  const router = useRouter();

  // Track GA4 event on asset view
  useEffect(() => {
    const visualAsset: VisualAsset = {
      id: photo.code,
      assetCode: photo.code,
      discipline: discipline.slug as any,
      disciplineCode: (photo.code.split("-")[1] as any) || "FASH",
      projectId: photo.project,
      projectCode: photo.code.split("-")[2] || "GEN",
      sequenceNumber: parseInt(photo.code.match(/(\d+)$/)?.[1] || "1", 10),
      seoSlug: canonicalSlug,
      canonicalPath: `/${discipline.slug}/${canonicalSlug}`,
      legacyCodePath: `/${discipline.slug}/${photo.code}`,
      title: `${photo.project} — ${photo.code}`,
      subDisciplines: photo.subdiscipline ? [photo.subdiscipline] : [],
      year: photo.date || 2024,
      inheritProjectCredits: true,
      credits: [
        photo.client ? { role: "Client", name: photo.client } : null,
        photo.model ? { role: "Model", name: photo.model } : null,
        photo.makeupArtist ? { role: "Makeup Artist", name: photo.makeupArtist } : null,
        photo.assistant ? { role: "Assistant", name: photo.assistant } : null,
      ].filter(Boolean) as any[],
      mediaType: "image",
      srcUrl: resolvedImage,
      altText: `${photo.project} — ${photo.code}`,
      metaTitle: `${photo.project} — ${photo.discipline}`,
      metaDescription: photo.caption || "",
      keywords: photo.keywords ? photo.keywords.split(",").map((k) => k.trim()) : [],
      status: "published",
      featuredInDiscipline: true,
      sortOrder: 1,
      updatedAt: new Date().toISOString(),
    };

    trackPortfolioAssetView(visualAsset, {
      id: photo.project,
      projectCode: photo.code.split("-")[2] || "GEN",
      title: photo.project,
      slug: canonicalSlug,
      discipline: discipline.slug as any,
      year: photo.date || 2024,
      clientName: photo.client,
      defaultSubDisciplines: [photo.subdiscipline],
      defaultCredits: visualAsset.credits,
      featured: true,
      sortOrder: 1,
    });
  }, [photo.code, canonicalSlug, discipline.slug]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/$discipline", params: { discipline: discipline.slug } });
    }
  };

  const handleCreditClick = (role: string, name: string) => {
    trackCreditClick(role, name, photo.code);
  };

  const handleCommissionClick = () => {
    trackCommissionInquiryFromAsset(photo.code, discipline.label);
  };

  // Deterministic Alt Text:
  // "{Project} — {Sub-Discipline} {Discipline} by Siavash Akbari{if Client: ' for ' + Client}{if Model: ', featuring ' + Model} ({Year}) — {AssetCode}"
  const specialty = photo.subdiscipline ? `${photo.subdiscipline} ` : "";
  const clientAlt = photo.client ? ` for ${photo.client}` : "";
  const modelAlt = photo.model ? `, featuring ${photo.model}` : "";
  const yearAlt = photo.date ? ` (${photo.date})` : "";
  const richAltText = `${photo.project} — ${specialty}${discipline.label} by Siavash Akbari${clientAlt}${modelAlt}${yearAlt} — ${photo.code}`;

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-[#EFEFEF] pb-24 pt-6 md:pt-10 px-6 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        {/* Back navigation pill indicator */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#2CE3C0] hover:text-white uppercase transition-colors px-3 py-1.5 rounded-full border border-[#2CE3C0]/30 hover:border-white bg-[#2CE3C0]/10 hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {discipline.label}</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>{discipline.label}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-[#2CE3C0]">{photo.code}</span>
          </div>
        </div>

        {/* Top Hero Section: Photo on Left (or stacked on mobile), Narrative on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Photo on Left */}
          <div className="relative w-full rounded-sm overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center">
            <img
              src={resolvedImage}
              alt={richAltText}
              className="w-full h-auto max-h-[78vh] object-contain"
              loading="eager"
            />
          </div>

          {/* Right Column: Metadata & Details Matrix */}
          <div className="flex flex-col justify-start space-y-6">
            <div>
              <div className="text-xs font-mono text-[#2CE3C0] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{photo.project} Series</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-normal leading-snug tracking-tight text-white">
                {photo.caption?.trim() || `${photo.project} — Frame ${photo.code.split("-").pop() || "01"}`}
              </h1>
            </div>

            <div className="border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
              {/* Row 1: Services Breadcrumb: "{Discipline} / {Sub-Discipline} / {Project or Client}" */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  Services
                </div>
                <div className="text-neutral-200 font-sans">
                  {photo.discipline}
                  {photo.subdiscipline ? ` / ${photo.subdiscipline}` : ""}
                  {photo.client ? ` / ${photo.client}` : (photo.project ? ` / ${photo.project}` : "")}
                </div>
              </div>

              {/* Row 2: Statistics & Asset Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  Details
                </div>
                <div className="space-y-1.5 text-neutral-200 font-sans">
                  <div>
                    Asset Code: <span className="font-mono text-[#2CE3C0] font-semibold">{photo.code}</span>
                  </div>
                  <div>
                    Canonical URL: <span className="font-mono text-xs text-neutral-400">/{discipline.slug}/{canonicalSlug}</span>
                  </div>
                  {photo.date && <div>Year / Date: {photo.date}</div>}
                  {photo.keywords && (
                    <div className="text-xs text-neutral-400">Keywords: {photo.keywords}</div>
                  )}
                </div>
              </div>

              {/* Row 3: Clients & Crew Credits */}
              {(photo.client || photo.model || photo.makeupArtist || photo.assistant) && (
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                  <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                    Credits
                  </div>
                  <div className="text-neutral-200 font-sans flex flex-wrap gap-x-6 gap-y-2">
                    {photo.client && (
                      <div
                        onClick={() => handleCreditClick("Client", photo.client)}
                        className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                      >
                        Client: <strong className="text-white font-medium">{photo.client}</strong>
                      </div>
                    )}
                    {photo.model && (
                      <div
                        onClick={() => handleCreditClick("Model", photo.model)}
                        className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                      >
                        Model: <strong className="text-white font-medium">{photo.model}</strong>
                      </div>
                    )}
                    {photo.makeupArtist && (
                      <div
                        onClick={() => handleCreditClick("Makeup Artist", photo.makeupArtist)}
                        className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                      >
                        MUA: <strong className="text-white font-medium">{photo.makeupArtist}</strong>
                      </div>
                    )}
                    {photo.assistant && (
                      <div
                        onClick={() => handleCreditClick("Assistant", photo.assistant)}
                        className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                      >
                        Assistant: <strong className="text-white font-medium">{photo.assistant}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Inquire Action Button */}
            <div className="pt-4">
              <a
                href="/contact"
                onClick={handleCommissionClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold tracking-wider uppercase transition-all duration-300"
              >
                <span>Commission / License This Work</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
