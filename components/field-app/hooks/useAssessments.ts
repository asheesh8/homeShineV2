"use client";

import { startTransition, useState } from "react";
import type { DialogState, ToastState } from "@/components/field-app/types";
import type { View } from "@/components/field-app/types";
import { CHECKOUT_PLANS } from "@/components/field-app/utils";
import {
  createAssessment,
  deleteAssessment,
  fetchAssessments,
  requestAiSummary,
  updateAssessment,
} from "@/components/field-app/api";
import {
  type Assessment,
  type CheckoutData,
  type SectionDefinition,
  type SectionValue,
  emptyOwner,
  formatOwnerAddress,
  makeAssessment,
  sampleAssessments,
} from "@/lib/simple-field";

type NotifyFns = {
  showToast: (t: ToastState) => void;
  showDialog: (d: DialogState) => void;
};

export function useAssessments({ showToast, showDialog }: NotifyFns) {
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [view, setView] = useState<View>("pipeline");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionDefinition | null>(null);
  const [ownerDraft, setOwnerDraft] = useState(emptyOwner);
  const [sectionDraft, setSectionDraft] = useState<SectionValue>({});
  const [writeupDraft, setWriteupDraft] = useState("");
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  const currentAssessment = assessments?.find((a) => a.id === currentId) ?? null;

  async function loadAssessments() {
    try {
      const loaded = await fetchAssessments();
      startTransition(() => setAssessments(loaded));
    } catch {
      startTransition(() => setAssessments(sampleAssessments()));
    }
  }

  function openNewAssessment() {
    setOwnerDraft(emptyOwner);
    setWriteupDraft("");
    setCurrentId(null);
    setView("owner");
  }

  function openAssessment(assessment: Assessment) {
    setCurrentId(assessment.id);
    setWriteupDraft(assessment.writeup ?? "");
    setView("menu");
  }

  async function saveOwner() {
    const missing = [
      !ownerDraft.name && "Owner name",
      !ownerDraft.street && "Street",
      !ownerDraft.city && "Town / City",
      !ownerDraft.state && "State",
      !ownerDraft.phone && "Phone",
      !ownerDraft.email && "Email",
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
      showDialog({ tone: "error", title: "Customer info is missing", body: `Please fill out:\n\n${missing.join("\n")}` });
      return;
    }

    const assessment = makeAssessment();
    assessment.owner = ownerDraft;
    assessment.status = "ongoing";

    try {
      const created = await createAssessment(assessment);
      startTransition(() => {
        setAssessments((prev) => [created, ...(prev ?? [])]);
        setCurrentId(created.id);
        setView("menu");
      });
    } catch (err) {
      showDialog({ tone: "error", title: "Assessment could not be created", body: err instanceof Error ? err.message : "Please try again." });
    }
  }

  function openSection(section: SectionDefinition) {
    if (!currentAssessment) return;
    setCurrentSection(section);
    setSectionDraft(currentAssessment.sections[section.id] ?? {});
    setView("section");
  }

  async function saveSection() {
    if (!currentAssessment || !currentSection) return;
    const next: Assessment = {
      ...currentAssessment,
      updatedAt: new Date().toISOString(),
      sections: { ...currentAssessment.sections, [currentSection.id]: sectionDraft },
    };
    try {
      const saved = await updateAssessment(next);
      startTransition(() => {
        setAssessments((prev) => (prev ?? []).map((a) => (a.id === saved.id ? saved : a)));
        setCurrentId(saved.id);
        setWriteupDraft(saved.writeup ?? "");
        setCurrentSection(null);
        setView("menu");
      });
      showToast({ tone: "success", title: "Section saved", description: `${currentSection.label} was saved.` });
    } catch (err) {
      showDialog({ tone: "error", title: "Section could not be saved", body: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function updateStatus(status: Assessment["status"]) {
    if (!currentAssessment) return;
    try {
      const saved = await updateAssessment({ ...currentAssessment, status, updatedAt: new Date().toISOString() });
      startTransition(() => setAssessments((prev) => (prev ?? []).map((a) => (a.id === saved.id ? saved : a))));
    } catch (err) {
      showDialog({ tone: "error", title: "Status could not be updated", body: err instanceof Error ? err.message : "Please try again." });
    }
  }

  function askDeleteDraft(id: string) {
    const target = (assessments ?? []).find((a) => a.id === id);
    if (!target) return;
    showDialog({
      tone: "confirm",
      title: "Delete this draft?",
      body: `${target.owner.name}\n${formatOwnerAddress(target.owner)}\n${target.owner.phone}`,
      confirmLabel: "Delete",
      cancelLabel: "Keep",
      onConfirm: async () => {
        try {
          await deleteAssessment(id);
          startTransition(() => {
            setAssessments((prev) => (prev ?? []).filter((a) => a.id !== id));
            if (currentId === id) { setCurrentId(null); setView("pipeline"); }
          });
          showToast({ tone: "success", title: "Draft deleted", description: `${target.owner.name}'s draft was removed.` });
        } catch (err) {
          showDialog({ tone: "error", title: "Draft could not be deleted", body: err instanceof Error ? err.message : "Please try again." });
        }
      },
    });
  }

  async function saveAndReturn() {
    if (!currentAssessment) return;
    const next = { ...currentAssessment, updatedAt: new Date().toISOString(), writeup: writeupDraft.trim() };
    try {
      const saved = await updateAssessment(next);
      startTransition(() => {
        setAssessments((prev) => (prev ?? []).map((a) => (a.id === saved.id ? saved : a)));
        setCurrentId(null);
        setView("pipeline");
      });
      showToast({ tone: "success", title: "Assessment saved", description: "Download documents from the pipeline card." });
    } catch (err) {
      showDialog({ tone: "error", title: "Assessment could not be saved", body: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function generateAiSummary() {
    if (!currentAssessment) return;
    setGeneratingAiSummary(true);
    try {
      const summary = await requestAiSummary({ ...currentAssessment, writeup: writeupDraft.trim() });
      const saved = await updateAssessment({
        ...currentAssessment,
        updatedAt: new Date().toISOString(),
        writeup: writeupDraft.trim(),
        aiSummary: { ...summary, generatedAt: new Date().toISOString() },
      });
      startTransition(() => setAssessments((prev) => (prev ?? []).map((a) => (a.id === saved.id ? saved : a))));
      showToast({ tone: "success", title: "AI summary ready", description: "A homeowner-friendly summary was added." });
    } catch (err) {
      showDialog({ tone: "error", title: "AI summary could not be generated", body: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setGeneratingAiSummary(false);
    }
  }

  async function saveCheckout(nextCheckout: CheckoutData) {
    if (!currentAssessment) return;
    try {
      const saved = await updateAssessment({
        ...currentAssessment,
        checkout: nextCheckout,
        updatedAt: new Date().toISOString(),
        writeup: writeupDraft.trim(),
      });
      startTransition(() => setAssessments((prev) => (prev ?? []).map((a) => (a.id === saved.id ? saved : a))));
      showToast({ tone: "success", title: "Checkout saved", description: `${nextCheckout.planName} is attached.` });
    } catch (err) {
      showDialog({ tone: "error", title: "Checkout could not be saved", body: err instanceof Error ? err.message : "Please try again." });
    }
  }

  function pickPlan(plan: (typeof CHECKOUT_PLANS)[number]) {
    const existing = currentAssessment?.checkout;
    void saveCheckout({
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      paymentOption: plan.id === "protection" ? existing?.paymentOption ?? "deposit-monthly" : "full",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      contractNote: existing?.contractNote ?? "",
    });
  }

  function updatePaymentOption(paymentOption: CheckoutData["paymentOption"]) {
    if (currentAssessment?.checkout) void saveCheckout({ ...currentAssessment.checkout, paymentOption });
  }

  function updateContractNote(contractNote: string) {
    if (currentAssessment?.checkout) void saveCheckout({ ...currentAssessment.checkout, contractNote });
  }

  return {
    assessments,
    view,
    currentAssessment,
    currentSection,
    ownerDraft,
    sectionDraft,
    writeupDraft,
    generatingAiSummary,
    setOwnerDraft,
    setSectionDraft,
    setWriteupDraft,
    setView,
    loadAssessments,
    openNewAssessment,
    openAssessment,
    saveOwner,
    openSection,
    saveSection,
    updateStatus,
    askDeleteDraft,
    saveAndReturn,
    generateAiSummary,
    pickPlan,
    updatePaymentOption,
    updateContractNote,
  };
}
