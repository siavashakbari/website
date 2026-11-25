import type { BlogBlock } from "@/types/admin";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

const field = "w-full rounded-lg border border-white/15 bg-black/50 p-3 text-white";

export function BlogBlocksEditor({
  blocks,
  onChange,
  onUpload,
}: {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-white/15 p-4">
      <legend className="px-2 text-sm font-semibold">Article blocks</legend>
      {blocks.map((block, index) => (
        <fieldset key={block.id} className="space-y-3 rounded-lg border border-white/15 p-3">
          <legend className="px-2 capitalize">
            {index + 1}. {block.kind}
          </legend>
          <div className="flex justify-end gap-1">
            {[-1, 1].map((direction) => {
              const target = index + direction;
              const Icon = direction < 0 ? ArrowUp : ArrowDown;
              return (
                <button
                  key={direction}
                  type="button"
                  className="p-2 disabled:opacity-30"
                  aria-label={direction < 0 ? "Move block up" : "Move block down"}
                  disabled={target < 0 || target >= blocks.length}
                  onClick={() => {
                    const next = [...blocks];
                    [next[index], next[target]] = [next[target], next[index]];
                    onChange(next);
                  }}
                >
                  <Icon size={16} />
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Remove block"
              className="p-2 text-red-300"
              onClick={() => onChange(blocks.filter((item) => item.id !== block.id))}
            >
              <Trash2 size={16} />
            </button>
          </div>
          {block.kind === "video" && (
            <video controls preload="metadata" src={block.url} className="max-h-56 w-full" />
          )}
          {(block.kind === "image" || block.kind === "gif") && (
            <img src={block.url} alt="" className="mx-auto max-h-56 max-w-full object-contain" />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {(["en", "fa"] as const).map((lang) => (
              <label key={lang} className="space-y-1">
                <span>
                  {lang === "en" ? "English" : "Persian"}{" "}
                  {block.kind === "text" ? "text" : "caption"}
                </span>
                <textarea
                  className={field}
                  rows={block.kind === "text" ? 5 : 2}
                  lang={lang}
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  value={block[lang]}
                  onChange={(event) =>
                    onChange(
                      blocks.map((item) =>
                        item.id === block.id ? { ...item, [lang]: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-[#2CE3C0]/60 px-3 py-2"
          onClick={() =>
            onChange([...blocks, { id: crypto.randomUUID(), kind: "text", en: "", fa: "" }])
          }
        >
          Add bilingual text
        </button>
        <label className="space-y-1">
          <span className="block">Add image, video, or GIF</span>
          <input
            type="file"
            accept="image/*,video/*"
            className="max-w-full"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
    </fieldset>
  );
}
