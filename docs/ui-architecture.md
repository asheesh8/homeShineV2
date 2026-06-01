# HomeSHINE UI Architecture

## Design Pattern

The field app now follows a lightweight **controller + presentational components** pattern:

- `components/simple-field-app.tsx` owns state, API calls, routing between app views, and business events.
- `components/field-app/ui.tsx` contains reusable UI primitives such as panels, buttons, inputs, badges, toasts, and dialogs.
- `components/field-app/utils.ts` contains display helpers, checkout plan constants, status labels, and small formatting helpers.
- `lib/field-app-documents.ts` owns printable document generation, so customer packet markup is separate from the interactive UI.
- `lib/simple-field.ts` remains the domain model and static field definitions.

This keeps the app readable without adding a heavy state-management framework.

## Component UML

```mermaid
classDiagram
  class SimpleFieldApp {
    +Session session
    +Assessment[] assessments
    +View view
    +saveOwner()
    +saveSection()
    +generateAiSummary()
    +saveCheckout()
  }

  class PipelineScreen {
    +Assessment[] assessments
    +StatusFilter statusFilter
    +onOpenAssessment()
  }

  class OwnerScreen {
    +Owner ownerDraft
    +onSave()
  }

  class MenuScreen {
    +Assessment assessment
    +writeupDraft string
    +onOpenSection()
    +onSave()
  }

  class SectionScreen {
    +SectionDefinition section
    +SectionValue sectionDraft
    +onSave()
  }

  class CheckoutPanel {
    +Assessment assessment
    +onPickPlan()
    +onPaymentOption()
  }

  class FieldAppUI {
    +Button
    +Panel
    +TextInput
    +TextArea
    +Badge
    +ToastHost
    +Dialog
  }

  class FieldDocuments {
    +openNotesDocument()
    +openReceiptDocument()
    +openCheckoutDocument()
    +openContractDocument()
    +openDiplomaDocument()
  }

  SimpleFieldApp --> PipelineScreen
  SimpleFieldApp --> OwnerScreen
  SimpleFieldApp --> MenuScreen
  SimpleFieldApp --> SectionScreen
  MenuScreen --> CheckoutPanel
  PipelineScreen --> FieldDocuments
  MenuScreen --> FieldDocuments
  PipelineScreen --> FieldAppUI
  OwnerScreen --> FieldAppUI
  MenuScreen --> FieldAppUI
  SectionScreen --> FieldAppUI
```

## User Flow UML

```mermaid
flowchart TD
  Login["Admin login"] --> Pipeline["Assessment pipeline"]
  Pipeline --> NewOwner["New owner form"]
  NewOwner --> Menu["Assessment workspace"]
  Pipeline --> Menu
  Menu --> Section["Section detail form"]
  Section --> Menu
  Menu --> Summary["Generate AI summary"]
  Menu --> Finished{"Status finished?"}
  Finished -- "No" --> Save["Save assessment"]
  Finished -- "Yes" --> Checkout["Pick checkout plan"]
  Checkout --> Docs["Open packet documents"]
  Save --> Pipeline
  Docs --> Pipeline
```

## Responsive Intent

The UI is phone-first, with single-column forms and full-width actions on smaller screens. Tablets keep compact panels and switch important grids to two columns where there is room. Desktop uses a constrained content width so the field workflow stays scannable instead of stretching edge to edge.
