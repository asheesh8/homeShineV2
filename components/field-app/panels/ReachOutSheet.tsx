"use client";

import { useState } from "react";
import { X, Copy, MessageSquare, Star, Gift, Check } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import type { Assessment } from "@/lib/simple-field";

const GOOGLE_REVIEW_LINK = "https://g.page/r/PLACEHOLDER_REVIEW_LINK/review";

function buildMessage(clientName: string, status: Assessment["status"]): string {
  const first = clientName.split(" ")[0] || clientName;
  if (status === "finished") {
    return (
      `Hey ${first}, this is Steven from HomeShine!\n\n` +
      `Hope we did a great job impressing you today. What would mean the world to us is word of mouth — and just a simple review on what your experience with us was like.\n\n` +
      `If you have a moment, you can leave one here:\n${GOOGLE_REVIEW_LINK}\n\n` +
      `And if you know anyone who could use the same treatment, send them our way — we'd love to take care of them too. Thanks again ${first}, truly appreciate you! 🙏`
    );
  }
  return (
    `Hey ${first}, this is Steven from HomeShine!\n\n` +
    `Just wanted to personally reach out and confirm we're all set for your upcoming appointment. ` +
    `If you have any questions or need to make any changes before then, don't hesitate to reply here.\n\n` +
    `Can't wait to show you what we can do! 🏠`
  );
}

function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function ReachOutSheet({
  assessment,
  onClose,
}: {
  assessment: Assessment;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isFinished = assessment.status === "finished";
  const firstName = (assessment.owner.name || "").split(" ")[0] || "there";
  const message = buildMessage(assessment.owner.name || "there", assessment.status);
  const clientPhone = cleanPhone(assessment.owner.phone || "");
  const smsHref = clientPhone
    ? `sms:${clientPhone}?body=${encodeURIComponent(message)}`
    : undefined;

  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div className="hs-sheet-backdrop" onClick={onClose}>
      <div className="hs-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="hs-sheet-handle" />

        {/* Hero */}
        <div className="hs-reachout-hero">
          <img src="/homeshine-truck.png" alt="HomeShine truck" className="hs-reachout-hero-img" />
          <div className="hs-reachout-hero-overlay" />
          <div className="hs-reachout-hero-logo"><HomeShineLogo size={44} /></div>
          <button type="button" className="hs-reachout-hero-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
          <div className="hs-reachout-hero-greeting">
            <span className="hs-reachout-hero-hey">Hey {firstName}! 👋</span>
            <span className="hs-reachout-hero-sub">
              {isFinished ? "Thank you for choosing HomeShine" : "HomeShine is on the way"}
            </span>
          </div>
        </div>

        {/* Client pill */}
        <div className="hs-reachout-client-strip">
          <div className="hs-reachout-client-info">
            <span className="hs-reachout-client-name">{assessment.owner.name || "Client"}</span>
            {assessment.owner.phone && (
              <span className="hs-reachout-client-phone">{assessment.owner.phone}</span>
            )}
          </div>
          <span className={`hs-reachout-status-pill hs-reachout-status-${assessment.status}`}>
            {isFinished ? "Job complete ✓" : "Upcoming"}
          </span>
        </div>

        {/* Message bubble */}
        <div className="hs-reachout-bubble-wrap">
          <div className="hs-reachout-bubble-label">
            <span>Message draft</span>
            <span className="hs-reachout-bubble-from">from Steven · HomeShine</span>
          </div>
          <div className="hs-reachout-bubble">
            <div className="hs-reachout-bubble-tail" />
            <p className="hs-reachout-bubble-text">{message}</p>
          </div>
        </div>

        {/* Finished-only extras */}
        {isFinished && (
          <div className="hs-reachout-extras">
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="hs-reachout-extra-row hs-reachout-extra-gold">
              <Star size={14} fill="currentColor" />
              <span>Leave a Google Review</span>
              <span className="hs-reachout-extra-arrow">→</span>
            </a>
            <div className="hs-reachout-extra-row hs-reachout-extra-green">
              <Gift size={14} />
              <span>Referral rewards included in message</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="hs-reachout-actions">
          {smsHref ? (
            <a href={smsHref} className="hs-reachout-sms-link">
              <MessageSquare size={16} />
              Send via SMS
            </a>
          ) : null}
          <button type="button" className="hs-reachout-copy-btn" onClick={handleCopy}>
            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy message</>}
          </button>
        </div>
      </div>
    </div>
  );
}
