"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  Mail,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { clientPacketDocument, diplomaDocument, fieldReportDocument } from "@/lib/field-app-documents";
import type { Assessment } from "@/lib/simple-field";

type DocKind = "report" | "packet" | "diploma";
type DocOption = { value: DocKind; label: string; generate: () => string };
type DocPreview = { value: DocKind; label: string; html: string; url: string; fileName: string };

function slugName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
}

export function DocumentPicker({
  assessment,
  hasCheckout,
}: {
  assessment: Assessment;
  hasCheckout: boolean;
}) {
  const [preview, setPreview] = useState<DocPreview | null>(null);
  const [shareError, setShareError] = useState("");

  const options: DocOption[] = [
    { value: "report", label: "Field Report", generate: () => fieldReportDocument(assessment) },
    ...(hasCheckout
      ? [
          { value: "packet" as DocKind, label: "Client Packet", generate: () => clientPacketDocument(assessment) },
          { value: "diploma" as DocKind, label: "HomeSHINE Diploma", generate: () => diplomaDocument(assessment) },
        ]
      : []),
  ];

  useEffect(() => {
    return () => { if (preview?.url) URL.revokeObjectURL(preview.url); };
  }, [preview?.url]);

  function openPreview(opt: DocOption) {
    const html = opt.generate();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setPreview((cur) => {
      if (cur?.url) URL.revokeObjectURL(cur.url);
      return { value: opt.value, label: opt.label, html, url, fileName: `homeshine-${opt.value}-${slugName(assessment.owner.name)}.html` };
    });
    setShareError("");
  }

  function closePreview() {
    setPreview((cur) => { if (cur?.url) URL.revokeObjectURL(cur.url); return null; });
    setShareError("");
  }

  function download() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview.url;
    a.download = preview.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function shareText() {
    return `${preview?.label ?? "HomeSHINE document"} for ${assessment.owner.name}. Please see the shared HomeSHINE file.`;
  }

  async function share() {
    if (!preview) return;
    setShareError("");
    try {
      const file = new File([preview.html], preview.fileName, { type: "text/html" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: preview.label, text: shareText(), files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: preview.label, text: shareText() });
        return;
      }
      setShareError("Sharing is not available in this browser. Use Download, Email, or Message instead.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShareError("Could not open the share sheet. Download the file or send it by email/message.");
    }
  }

  function emailDoc() {
    if (!preview) return;
    const subject = `${preview.label} for ${assessment.owner.name}`;
    const body = `${shareText()}\n\nIf your device supports attachments, attach the downloaded ${preview.fileName} file.`;
    window.location.href = `mailto:${encodeURIComponent(assessment.owner.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function messageDoc() {
    if (!preview) return;
    const phone = assessment.owner.phone.replace(/[^\d+]/g, "");
    const sep = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
    window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(shareText())}`;
  }

  return (
    <>
      <div className="hs-doc-picker">
        <Eye size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
        <select
          className="hs-doc-select"
          defaultValue=""
          onChange={(e) => {
            const opt = options.find((o) => o.value === e.target.value);
            if (opt) { openPreview(opt); e.currentTarget.value = ""; }
          }}
        >
          <option value="" disabled>Preview document...</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} style={{ color: "var(--muted)", flexShrink: 0, pointerEvents: "none", marginLeft: -24 }} />
      </div>

      {preview && createPortal(
        <div className="hs-doc-preview-backdrop" role="dialog" aria-modal="true" aria-labelledby="doc-preview-title">
          <div className="hs-doc-preview-panel">
            <div className="hs-doc-preview-header">
              <div>
                <p className="hs-kicker">Document Preview</p>
                <h2 id="doc-preview-title">{preview.label}</h2>
              </div>
              <button type="button" className="hs-icon-btn" aria-label="Close preview" onClick={closePreview}>
                <X size={18} />
              </button>
            </div>
            <div className="hs-doc-preview-shell">
              <iframe className="hs-doc-preview-frame" title={preview.label} srcDoc={preview.html} />
            </div>
            {shareError && <p className="hs-doc-share-error">{shareError}</p>}
            <div className="hs-doc-preview-actions">
              <Button type="button" onClick={share}><Share2 size={17} />Share</Button>
              <Button type="button" variant="secondary" onClick={download}><Download size={17} />Download</Button>
              <Button type="button" variant="secondary" onClick={emailDoc}><Mail size={17} />Email</Button>
              <Button type="button" variant="secondary" onClick={messageDoc}><MessageCircle size={17} />Message</Button>
              <Button type="button" variant="ghost" onClick={() => window.open(preview.url, "_blank", "noopener,noreferrer")}>
                <ExternalLink size={17} />Open
              </Button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
