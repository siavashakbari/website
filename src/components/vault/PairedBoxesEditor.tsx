import React, { useState, useEffect } from "react";
import { Code2, ListPlus, Plus, Trash2, Copy, Check, AlertCircle } from "lucide-react";

export interface KeyValuePair {
  key: string;
  value: string;
}

interface PairedBoxesEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  title?: string;
  description?: string;
  allowEmpty?: boolean;
}

export function PairedBoxesEditor({
  pairs,
  onChange,
  title = "Additional Paired Boxes",
  description = "Add custom metadata attributes (e.g. Model : Sara, Year : 2020)",
}: PairedBoxesEditorProps) {
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync JSON text when pairs change from outside while not actively typing in JSON mode
  useEffect(() => {
    if (!isJsonMode) {
      const obj: Record<string, string> = {};
      pairs.forEach((p) => {
        if (p.key.trim() || p.value.trim()) {
          obj[p.key.trim()] = p.value.trim();
        }
      });
      setJsonText(JSON.stringify(obj, null, 2));
    }
  }, [pairs, isJsonMode]);

  const handleToggleMode = () => {
    if (!isJsonMode) {
      // Switching to JSON mode: build JSON from current pairs
      const obj: Record<string, string> = {};
      pairs.forEach((p) => {
        if (p.key.trim() || p.value.trim()) {
          obj[p.key.trim()] = p.value.trim();
        }
      });
      setJsonText(JSON.stringify(obj, null, 2));
      setJsonError(null);
      setIsJsonMode(true);
    } else {
      // Switching back to Boxes mode: parse JSON and update pairs
      try {
        const parsed = JSON.parse(jsonText || "{}");
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("JSON must be a key-value object (e.g. { \"Model\": \"Sara\" })");
        }
        const newPairs: KeyValuePair[] = Object.entries(parsed).map(([key, val]) => ({
          key: String(key),
          value: typeof val === "object" ? JSON.stringify(val) : String(val ?? ""),
        }));
        onChange(newPairs);
        setJsonError(null);
        setIsJsonMode(false);
      } catch (err: any) {
        setJsonError(err.message || "Invalid JSON syntax. Please correct before switching.");
      }
    }
  };

  const handleAddPair = () => {
    onChange([...pairs, { key: "", value: "" }]);
  };

  const handleUpdatePair = (index: number, field: "key" | "value", val: string) => {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const handleRemovePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text || "{}");
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const newPairs: KeyValuePair[] = Object.entries(parsed).map(([key, val]) => ({
          key: String(key),
          value: typeof val === "object" ? JSON.stringify(val) : String(val ?? ""),
        }));
        onChange(newPairs);
        setJsonError(null);
      }
    } catch {
      // Keep typing without blocking, will validate on switch
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/10">
      {/* Header with Switch Mode Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
            {title}
          </span>
          <span className="text-[11px] text-neutral-500 block">{description}</span>
        </div>

        <div className="flex items-center gap-2">
          {isJsonMode && (
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy JSON to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2CE3C0]" />
                  <span className="text-[#2CE3C0]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
              isJsonMode
                ? "bg-[#2CE3C0] text-black border-[#2CE3C0] font-semibold shadow-[0_0_10px_rgba(44,227,192,0.3)]"
                : "bg-white/5 text-[#2CE3C0] border-[#2CE3C0]/40 hover:bg-[#2CE3C0]/10"
            }`}
          >
            {isJsonMode ? (
              <>
                <ListPlus className="w-3.5 h-3.5" />
                <span>Switch to Boxes</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span>Turn into JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Mode View */}
      {isJsonMode ? (
        <div className="space-y-2">
          {jsonError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={5}
            placeholder='{\n  "Model": "Sara",\n  "Year": "2020"\n}'
            className="w-full bg-black/70 border border-white/15 rounded-lg p-3 font-mono text-xs text-[#2CE3C0] focus:outline-none focus:border-[#2CE3C0] transition-colors resize-y selection:bg-[#2CE3C0] selection:text-black"
          />
          <p className="text-[11px] text-neutral-500 font-mono">
            Copy and paste this JSON code to or from other cards.
          </p>
        </div>
      ) : (
        /* Paired Boxes Mode View */
        <div className="space-y-2">
          {pairs.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-1">
              No paired attributes yet. Click &quot;Add Pair&quot; below.
            </p>
          ) : (
            <div className="space-y-2">
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pair.key}
                    onChange={(e) => handleUpdatePair(idx, "key", e.target.value)}
                    placeholder="Key (e.g. Model)"
                    className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                  />
                  <span className="text-neutral-500 font-mono text-xs">:</span>
                  <input
                    type="text"
                    value={pair.value}
                    onChange={(e) => handleUpdatePair(idx, "value", e.target.value)}
                    placeholder="Value (e.g. Sara)"
                    className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePair(idx)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddPair}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-xs text-neutral-400 hover:text-white hover:border-[#2CE3C0] transition-colors cursor-pointer mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pair</span>
          </button>
        </div>
      )}
    </div>
  );
}
