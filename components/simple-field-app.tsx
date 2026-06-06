"use client";

import { useEffect, useState } from "react";
import type { StatusFilter } from "@/components/field-app/types";
import { AppHeader } from "@/components/field-app/shared/AppHeader";
import { LoginScreen } from "@/components/field-app/screens/LoginScreen";
import { PipelineScreen } from "@/components/field-app/screens/PipelineScreen";
import { OwnerScreen } from "@/components/field-app/screens/OwnerScreen";
import { MenuScreen } from "@/components/field-app/screens/MenuScreen";
import { SectionScreen } from "@/components/field-app/screens/SectionScreen";
import { StepperShell } from "@/components/field-app/stepper/StepperShell";
import { Dialog, ToastHost } from "@/components/field-app/ui";
import { useAssessments } from "@/components/field-app/hooks/useAssessments";
import { useNotifications } from "@/components/field-app/hooks/useNotifications";
import { useSession } from "@/components/field-app/hooks/useSession";
import { useStepperFlow } from "@/components/field-app/hooks/useStepperFlow";
import { getMatches } from "@/components/field-app/utils";
import { stateOptions, townOptions } from "@/lib/simple-field";
// (townOptions/stateMatches still used for the owner screen below)

export default function SimpleFieldApp() {
  const { toast, dialog, showToast, showDialog, closeToast, closeDialog } = useNotifications();
  const { session, loginForm, loginError, login, logout, updateLoginField } = useSession();
  const stepperFlow = useStepperFlow({ showToast, showDialog });
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

  function openStepper() {
    stepperFlow.reset();
    setView("stepper");
  }

  function exitStepper() {
    setView("pipeline");
    void loadAssessments(); // refresh list in case a draft was saved
  }

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
            session={session}
            assessments={assessments}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onNewAssessment={openNewAssessment}
            onOpenAssessment={openAssessment}
            onDeleteDraft={askDeleteDraft}
            onNewQuote={openStepper}
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
            onOpenSection={openSection}
            onSave={saveAndReturn}
          />
        )}

        {session && view === "stepper" && (
          <StepperShell
            key="stepper"
            flow={stepperFlow}
            assessments={assessments}
            onExit={exitStepper}
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
