"use client";

import { useEffect, useState } from "react";
import type { StatusFilter } from "@/components/field-app/types";
import { AppHeader } from "@/components/field-app/shared/AppHeader";
import { LoginScreen } from "@/components/field-app/screens/LoginScreen";
import { PipelineScreen } from "@/components/field-app/screens/PipelineScreen";
import { OwnerScreen } from "@/components/field-app/screens/OwnerScreen";
import { MenuScreen } from "@/components/field-app/screens/MenuScreen";
import { SectionScreen } from "@/components/field-app/screens/SectionScreen";
import { Dialog, ToastHost } from "@/components/field-app/ui";
import { useAssessments } from "@/components/field-app/hooks/useAssessments";
import { useNotifications } from "@/components/field-app/hooks/useNotifications";
import { useSession } from "@/components/field-app/hooks/useSession";
import { getMatches } from "@/components/field-app/utils";
import { stateOptions, townOptions } from "@/lib/simple-field";

export default function SimpleFieldApp() {
  const { toast, dialog, showToast, showDialog, closeToast, closeDialog } = useNotifications();
  const { session, loginForm, loginError, login, logout, updateLoginField } = useSession();
  const {
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
  } = useAssessments({ showToast, showDialog });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => { void loadAssessments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const townMatches = getMatches(ownerDraft.city, townOptions);
  const stateMatches = getMatches(ownerDraft.state, stateOptions);

  return (
    <>
      <ToastHost toast={toast} onClose={closeToast} />
      <Dialog dialog={dialog} onClose={closeDialog} />
      <main className="hs-app-shell">
        <AppHeader session={session} onLogout={logout} />

        {!session && (
          <LoginScreen
            loginForm={loginForm}
            loginError={loginError}
            onChange={updateLoginField}
            onSubmit={login}
          />
        )}

        {session && view === "pipeline" && (
          <PipelineScreen
            key="pipeline"
            assessments={assessments}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onNewAssessment={openNewAssessment}
            onOpenAssessment={openAssessment}
            onDeleteDraft={askDeleteDraft}
          />
        )}

        {session && view === "owner" && (
          <OwnerScreen
            key="owner"
            ownerDraft={ownerDraft}
            townMatches={townMatches}
            stateMatches={stateMatches}
            onOwnerChange={setOwnerDraft}
            onCancel={() => setView("pipeline")}
            onSave={saveOwner}
          />
        )}

        {session && view === "menu" && currentAssessment && (
          <MenuScreen
            key={`menu-${currentAssessment.id}`}
            assessment={currentAssessment}
            writeupDraft={writeupDraft}
            generatingAiSummary={generatingAiSummary}
            onBack={() => setView("pipeline")}
            onStatus={updateStatus}
            onDeleteDraft={askDeleteDraft}
            onWriteup={setWriteupDraft}
            onGenerateAiSummary={generateAiSummary}
            onPickPlan={pickPlan}
            onPaymentOption={updatePaymentOption}
            onNoteChange={updateContractNote}
            onOpenSection={openSection}
            onSave={saveAndReturn}
          />
        )}

        {session && view === "section" && currentSection && (
          <SectionScreen
            key={`section-${currentSection.id}`}
            section={currentSection}
            sectionDraft={sectionDraft}
            onDraft={setSectionDraft}
            onBack={() => setView("menu")}
            onSave={saveSection}
          />
        )}
      </main>
    </>
  );
}
