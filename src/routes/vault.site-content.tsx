import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  SITE_SEED,
  publishSiteContent,
  readSiteContent,
  type SiteContent,
  type SitePageId,
} from "@/lib/site-content";
import { waitForPublishedContentSave } from "@/lib/published-store";
import { uploadToCloudStorage } from "@/lib/cloud-storage";
import { getAboutEditorialSeedFields } from "./about";

export const Route = createFileRoute("/vault/site-content")({ component: SiteContentEditor });

const PAGE_NAMES: Record<SitePageId, string> = {
  landing: "Landing",
  about: "About",
  contact: "Contact",
  notFound: "404 Page",
};

type EditableSiteContent = SiteContent & { notFound: NonNullable<SiteContent["notFound"]> };

function editableDraft(): EditableSiteContent {
  const current = readSiteContent();
  const seed = current || SITE_SEED;
  const existing = new Set(seed.about.fields.map((field) => field.id));
  const existingLanding = new Set(seed.landing.fields.map((field) => field.id));
  return structuredClone({
    ...seed,
    notFound: seed.notFound || SITE_SEED.notFound!,
    landing: {
      ...seed.landing,
      imageUrl: seed.landing.imageUrl || SITE_SEED.landing.imageUrl,
      fields: [
        ...seed.landing.fields,
        ...SITE_SEED.landing.fields.filter((field) => !existingLanding.has(field.id)),
      ],
    },
    about: {
      ...seed.about,
      fields: [
        ...seed.about.fields,
        ...getAboutEditorialSeedFields().filter((field) => !existing.has(field.id)),
      ],
    },
  });
}

function SiteContentEditor() {
  const [original, setOriginal] = useState<SiteContent | null>(() => readSiteContent());
  const [draft, setDraft] = useState<EditableSiteContent>(editableDraft);
  const [pageId, setPageId] = useState<SitePageId>("landing");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const page = draft[pageId];
  const dirty = JSON.stringify(draft) !== JSON.stringify(original || SITE_SEED);

  const changeField = (id: string, lang: "en" | "fa", value: string) => {
    setDraft((current) => ({
      ...current,
      [pageId]: {
        ...current[pageId],
        fields: current[pageId].fields.map((field) =>
          field.id === id ? { ...field, value: { ...field.value, [lang]: value } } : field,
        ),
      },
    }));
    setMessage("");
  };
  const changeLink = (id: string, field: "href" | "en" | "fa", value: string) => {
    setDraft((current) => ({
      ...current,
      [pageId]: {
        ...current[pageId],
        links: current[pageId].links.map((link) =>
          link.id !== id
            ? link
            : field === "href"
              ? { ...link, href: value }
              : { ...link, label: { ...link.label, [field]: value } },
        ),
      },
    }));
    setMessage("");
  };

  const uploadSiteImage = async (target: "landing" | "notFound", file: File | undefined) => {
    if (!file) return;
    if (target === "notFound" ? file.type !== "image/gif" : !file.type.startsWith("image/")) {
      setMessage(
        target === "notFound" ? "Please select a GIF file." : "Please select an image file.",
      );
      return;
    }
    setUploadingImage(true);
    setMessage("");
    try {
      const uploaded = await uploadToCloudStorage(file, file.name, { contentType: file.type });
      setDraft((current) => ({
        ...current,
        [target]: { ...current[target], imageUrl: uploaded.url },
      }));
      setMessage("Image uploaded. Save changes to publish it on the page.");
    } catch (error) {
      setMessage(`Image upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      publishSiteContent(draft);
      await waitForPublishedContentSave();
      const reloaded = readSiteContent();
      setOriginal(reloaded);
      setMessage("Saved to server.");
    } catch (error) {
      setMessage(`Not saved: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-5 text-white sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Site Content</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Edit the fixed Landing, About, Contact, and 404 pages. English and Persian values save
          together through Vault publishing.
        </p>
        {!original && (
          <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            This published snapshot predates Site Content. Review the prefilled page copy, then save
            once to create the collection. Export a secure copy of the current published snapshot
            before live migration.
          </p>
        )}
      </div>
      <div role="tablist" aria-label="Site pages" className="flex flex-wrap gap-2">
        {(["landing", "about", "contact", "notFound"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === pageId}
            onClick={() => setPageId(id)}
            className={`rounded-lg border px-4 py-2 text-sm ${id === pageId ? "border-[#2CE3C0] bg-[#2CE3C0] text-black" : "border-white/20 text-neutral-300"}`}
          >
            {PAGE_NAMES[id]}
          </button>
        ))}
      </div>
      <form onSubmit={(event) => void save(event)} className="space-y-7">
        {page.fields.map((field) => (
          <fieldset
            key={field.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <legend className="px-1 text-sm font-medium text-[#2CE3C0]">
              {field.section} · {field.label}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["en", "fa"] as const).map((lang) => (
                <label key={lang} className="block text-xs text-neutral-300">
                  {lang === "en" ? "English" : "Persian"}
                  <textarea
                    dir={lang === "fa" ? "rtl" : "ltr"}
                    lang={lang}
                    rows={
                      field.id.toLowerCase().includes("description") || field.id === "intro" ? 4 : 2
                    }
                    value={field.value[lang]}
                    onChange={(event) => changeField(field.id, lang, event.target.value)}
                    className={`mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#2CE3C0] focus:outline-none ${lang === "fa" ? "font-farsi" : ""}`}
                  />
                </label>
              ))}
            </div>
            {(!field.value.en.trim() || !field.value.fa.trim()) && (
              <p className="mt-2 text-xs text-amber-300">
                Translation incomplete. The other language will appear as fallback.
              </p>
            )}
          </fieldset>
        ))}
        {pageId === "landing" && (
          <div className="space-y-3 rounded-xl border border-white/10 p-4">
            <label className="block text-sm text-neutral-300">
              Hero portrait URL (shared)
              <input
                type="text"
                value={page.imageUrl || ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    landing: { ...current.landing, imageUrl: event.target.value },
                  }))
                }
                placeholder="/hero-portrait-transparent.webp"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-3 text-sm text-white"
              />
            </label>
            <label className="block text-sm text-neutral-300">
              Upload replacement portrait to private Vault media storage
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={(event) => void uploadSiteImage("landing", event.target.files?.[0])}
                className="mt-2 block w-full text-sm text-neutral-300 file:mr-4 file:rounded-md file:border-0 file:bg-[#2CE3C0] file:px-3 file:py-2 file:text-black"
              />
            </label>
            {page.imageUrl && (
              <img
                src={page.imageUrl}
                alt="Hero portrait preview"
                className="max-h-64 max-w-full object-contain"
              />
            )}
          </div>
        )}
        {pageId === "notFound" && (
          <div className="space-y-3 rounded-xl border border-white/10 p-4">
            <label className="block text-sm text-neutral-300">
              404 GIF URL (shared)
              <input
                type="text"
                value={page.imageUrl || ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    notFound: { ...current.notFound, imageUrl: event.target.value },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-3 text-sm text-white"
              />
            </label>
            <label className="block text-sm text-neutral-300">
              Upload replacement GIF to private Vault media storage
              <input
                type="file"
                accept="image/gif"
                disabled={uploadingImage}
                onChange={(event) => void uploadSiteImage("notFound", event.target.files?.[0])}
                className="mt-2 block w-full text-sm text-neutral-300 file:mr-4 file:rounded-md file:border-0 file:bg-[#2CE3C0] file:px-3 file:py-2 file:text-black"
              />
            </label>
            {page.imageUrl && (
              <img
                src={page.imageUrl}
                alt="404 preview"
                className="mx-auto max-h-64 max-w-full object-contain"
              />
            )}
          </div>
        )}
        {page.links.map((link) => (
          <fieldset key={link.id} className="rounded-xl border border-white/10 p-4">
            <legend className="px-1 text-sm font-medium text-[#2CE3C0]">{link.id} link</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-neutral-300">
                English label
                <input
                  dir="ltr"
                  value={link.label.en}
                  onChange={(event) => changeLink(link.id, "en", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-neutral-300">
                Persian label
                <input
                  dir="rtl"
                  lang="fa"
                  value={link.label.fa}
                  onChange={(event) => changeLink(link.id, "fa", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-2 font-farsi text-sm text-white"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-neutral-300">
              Destination (shared)
              <input
                dir="ltr"
                value={link.href}
                onChange={(event) => changeLink(link.id, "href", event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 p-2 text-sm text-white"
              />
            </label>
          </fieldset>
        ))}
        <div className="sticky bottom-0 flex items-center gap-4 border-t border-white/15 bg-[#0A0A0A] py-4">
          <button
            type="submit"
            disabled={saving || uploadingImage || (!dirty && Boolean(original))}
            className="rounded-lg bg-[#2CE3C0] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : original ? "Save changes" : "Initialize Site Content"}
          </button>
          <span role="status" className="text-xs text-neutral-300">
            {message || (dirty ? "Unsaved changes" : "")}
          </span>
        </div>
      </form>
    </div>
  );
}
