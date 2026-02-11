# GPS Loan Application Manager

A full-stack loan application management system built with **ASP.NET Core 6** and **Angular 17** with Angular Material.

## Getting Started

### Prerequisites
- .NET 6 SDK (or .NET 7+/9+ SDK with .NET 6 ASP.NET Core Runtime)
- Node.js (includes npm)

### Running the Application
```bash
cd GPS.TechnicalInterview.Web/ClientApp
npm install
cd ..
dotnet run
```
The app will be available at `https://localhost:5001`.

---

## Features

- **Create** loan applications with validated form fields
- **View** all applications in a sortable Material table
- **Edit** existing applications with pre-populated form data
- **Delete** applications with a confirmation dialog

---

## Design Decisions

### Single Component for Create and Edit
Rather than building two separate form components, `CreateApplicationComponent` handles both modes. It checks for an `:applicationNumber` route parameter to determine the mode. In edit mode, the application number field is disabled and the form is pre-populated via an API call. The save button routes to either a POST (create) or PUT (update) endpoint depending on the mode.

### Reactive Forms Over Template-Driven Forms
Angular Reactive Forms were chosen for programmatic control over validation, value changes, and field state. This enabled features like subscribing to `valueChanges` on the amount and term fields to auto-calculate the monthly payment in real time, and programmatically disabling the application number field in edit mode.

### Custom Angular Material Theme
The project uses a custom Material theme (`custom-theme.scss`) instead of a prebuilt one. The prebuilt `indigo-pink` theme applied a pink/red accent color to interactive elements like the snackbar action button. A custom theme was created to set the accent to white while keeping the indigo primary, giving full control over the color palette without CSS overrides. The theme includes `mat.core()` for foundational styles like overlay positioning.

### Flat Form to Nested API Payload
The form uses a flat structure for simplicity (e.g., `firstName`, `lastName`, `amount`, `term`), but the API expects a nested object matching the C# model (`personalInformation.name.first`, `loanTerms.amount`). The `buildPayload()` method reshapes the flat form data into the nested structure and handles type conversions (string to number) before sending.

### Application Number Auto-Formatting
The application number follows a `000000-0000` format. Instead of requiring users to type the dash manually, a `keypress` handler restricts input to digits only, and an `input` handler auto-inserts the dash after the sixth digit.

### Confirmation Dialog for Deletes
The `ConfirmDialogComponent` is a reusable "dumb" dialog that receives a title and message via `MAT_DIALOG_DATA` injection and returns a boolean. The calling component handles the actual business logic (API call, table refresh, snackbar notification), keeping the dialog decoupled and reusable.

### Dual-Layer Validation
Form validation runs on both the frontend (Angular Validators) and backend (controller null/range checks). Frontend validation provides immediate user feedback; backend validation protects data integrity against direct API calls that bypass the UI.

### `getRawValue()` for Disabled Fields
Disabled form controls (monthly payment amount, application number in edit mode) are excluded from Angular's `.value` getter. Using `getRawValue()` ensures all fields are included in the payload regardless of their enabled/disabled state.

---

## Problems Overcome

### JSON Casing Mismatch
Angular sends camelCase JSON (`applicationNumber`) while C#'s default deserializer expected PascalCase (`ApplicationNumber`). This caused silent deserialization failures where all properties came in as null, triggering 400 errors. Resolved by configuring `JsonNamingPolicy.CamelCase` and `PropertyNameCaseInsensitive = true` in `Startup.cs`.

### DateTime Deserialization Failure
The original payload included `dateApplied: ''` (empty string), which could not be deserialized into C#'s `DateTime` type. The request was rejected at the model binding level before reaching the controller, making it difficult to debug. Resolved by removing `dateApplied` from the client payload entirely and having the server set it with `DateTime.UtcNow`.

### TypeScript Decorator Compilation Error
Angular's `@Inject(MAT_DIALOG_DATA)` decorator in the confirm dialog component failed to compile because `tsconfig.json` was missing `experimentalDecorators: true`. This is required for any TypeScript project using Angular's decorator-based syntax.

### Overlay Positioning After Theme Change
After switching from the prebuilt theme to a custom one, Material overlay components (menus, dialogs) rendered in incorrect positions. The prebuilt CSS included `mat.core()` styles for overlay positioning, but the custom theme initially omitted this. Adding `@include mat.core()` restored correct behavior.

### Double Required Asterisks
Required fields displayed two asterisks because the label text included a manual `*` character while Angular Material's `required` attribute also auto-generates one. Resolved by removing the manual asterisks and relying solely on the HTML `required` attribute to trigger Material's built-in indicator.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 6, C# |
| Frontend | Angular 17, TypeScript |
| UI Components | Angular Material 17 |
| Data Storage | JSON file (loanApplication.json) |
| Styling | SCSS, Custom Material Theme |
