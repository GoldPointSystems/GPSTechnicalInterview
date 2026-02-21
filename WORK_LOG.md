# GPS Technical Interview — Work Log

## Candidate: Jordan Postak
## Position: Junior Web Developer Technical Interview
## Repository: GPSTechnicalInterview

---

# Day 1 — Initial Project Setup

## Objective

Set up the technical interview project locally and review initial structure.

## Actions Taken

- Forked the GPSTechnicalInterview repository to my personal GitHub account.
- Cloned the forked repository to my local machine using VS Code.
- Opened the project in VS Code and reviewed the folder structure.
- Identified the Angular frontend project (GPS.TechnicalInterview.Web).
- Reviewed the provided design document and Figma prototype.
- Created a WORK_LOG.md file to document progress and decisions.

---

# Day 1 — Backend Build & Environment Fixes

## Objective

Resolve build errors and configure the local development environment.

## Actions Taken

- Attempted to run the backend using dotnet run and encountered build errors due to missing model classes (LoanTerms and PersonalInformation).
- Created LoanTerms.cs and PersonalInformation.cs models to match the structure referenced by LoanApplication.
- Discovered the controller expected PersonalInformation.Name.First and Name.Last rather than separate FirstName/LastName fields.
- Created a Name model and updated PersonalInformation to match the expected API contract.
- Attempted to run the application again and encountered a .NET version mismatch (project targets .NET 6).
- Installed the .NET 6 SDK to match the project’s target framework (net6.0).
- Verified installation with dotnet --list-sdks (confirmed 6.0.428).
- Generated and trusted a local HTTPS development certificate using dotnet dev-certs https --trust.
- Successfully launched the application locally at https://localhost:5001.

## Observations

The project includes an ASP.NET Core backend with an embedded Angular frontend. The exercise involves implementing dashboard functionality based on the provided Figma prototype and completing missing CRUD operations.

## What I Learned

- How backend models must match controller expectations and API contracts.
- The importance of debugging build errors systematically.
- How to resolve .NET runtime version mismatches.
- How HTTPS development certificates work in ASP.NET Core.
- The importance of running Git commands from the repository root.

---

# Day 1 — Backend Implementation

## Objective

Implement and verify CRUD functionality for loan applications.

## Actions Taken

- Reviewed ApplicationManagerController and identified that only the Create (POST) endpoint was implemented.
- Noticed a TODO comment indicating that CRUD operations needed to be added.
- Implemented a GetApplications endpoint to return stored loan applications from loanApplication.json.
- Restarted the application to confirm the endpoint builds and runs successfully.
- Used Invoke-RestMethod in PowerShell to test POST /ApplicationManager/CreateApplication and successfully created a sample application (A-1001).
- Verified GET /ApplicationManager/GetApplications returns the created record in JSON format.
- Confirmed that data is persisted to loanApplication.json.

## Result

The backend now supports creating and retrieving loan applications, completing the "Create" and "Read" portions of CRUD functionality.

---

# Day 1 — Frontend Integration

## Objective

Connect Angular frontend to backend API and render application data in the dashboard.

## Actions Taken

- Created TypeScript models to match the backend structure exactly (including nested objects), after running into issues where mismatched structure caused API errors.
- Implemented ApiService methods to call backend CRUD endpoints.
- Injected ApiService into ApplicationsComponent.
- Loaded applications on ngOnInit().
- Bound Angular Material table dataSource to the returned applications array.
- Added mat-cell templates for each column.
- Resolved a TypeScript module error related to model imports by resetting Angular build dependencies.
- Verified that created application (A-1001) successfully renders in the dashboard UI.

## Result

Confirmed full-stack functionality: backend data is retrieved and displayed correctly in the Angular dashboard.

---

# Day 1 — Create Application Integration

## Objective

Implement full Create functionality from Angular form to backend API.

## Actions Taken

- Implemented form validation in Angular to align with backend validation rules.
- Added numeric parsing and input sanitation for amount, monthly payment, and terms.
- Handled ASP.NET Core model binding errors (400 validation responses).
- Used browser developer tools to inspect network responses and identify JSON conversion issues.
- Successfully posted new loan applications from the UI to the backend.
- Verified persistence in loanApplication.json and immediate display in dashboard after redirect.

## Result

The application now supports full end-to-end creation of loan applications through the Angular UI, with proper validation and error handling.

---

# Day 1 — Delete Functionality & Data Integrity Improvements

## Objective

Implement and verify delete functionality from the Angular UI, and enforce data integrity on the backend.

## Actions Taken

- Added an actions column to the Angular Material table.
- Implemented a contextual menu (three-dot icon) using Angular Material mat-menu.
- Added Delete action with confirmation dialog.
- Connected Delete action to backend DELETE /ApplicationManager/DeleteApplication/{applicationNumber} endpoint.
- Identified duplicate application numbers issue during testing.
- Enforced unique ApplicationNumber constraint in the Create endpoint to prevent duplicates.
- Added backend 409 Conflict response when attempting to create duplicate application numbers.

## Result

- Applications can now be deleted directly from the dashboard.
- Application numbers are enforced as unique identifiers.
- Delete operations behave correctly because duplicate records are no longer allowed.
- Full Create, Read, and Delete functionality is now working end-to-end.

---

# Day 1 — UI Polish (Status + Date Formatting)

## Objective
Improve dashboard readability and better match the Figma design.

## Actions Taken
- Converted numeric status values (0/1/2) into user-friendly labels (New/Approved/Funded) in the Angular UI.
- Updated the Date Applied column to display date-only formatting to match the Figma mockup.

## Result
Dashboard table now matches the intended design more closely and is easier to read.

---

# Day 2 — Edit / Update Functionality

## Objective
Implement full update functionality from dashboard UI to backend API.

## Actions Taken
- Added edit navigation from Applications table via query parameter.
- Implemented edit mode detection in CreateApplicationComponent.
- Prefilled reactive form using existing application data.
- Disabled ApplicationNumber field during edit to preserve identifier integrity.
- Implemented PUT call to UpdateApplication endpoint.
- Preserved original DateApplied value on backend update.
- Verified updates persist to loanApplication.json and reflect immediately in dashboard.

## Result
The application now supports full CRUD (Create, Read, Update, Delete) functionality end-to-end with Angular frontend and ASP.NET Core backend.

---

# Day 2 — UI Enhancements

## Objective

Improve user experience by replacing basic browser interactions with a more polished UI consistent with the provided Figma design.

## Actions Taken

- Replaced default browser confirm() dialog with a custom Angular Material dialog component.
- Created a reusable ConfirmDialogComponent for confirmation workflows.
- Integrated MatDialog service into ApplicationsComponent.
- Passed dialog data dynamically (title, message, button labels).
- Connected dialog confirmation to backend Delete API.
- Ensured UI behavior matches Figma design (modal layout, actions, positioning).
- Improved overall UX by providing a cleaner and more professional interaction.

## Result

Delete actions now use a styled modal dialog consistent with the application design, improving usability and aligning closely with the Figma prototype.

---

# Day 2 — UI Enhancements & Final Features

## Objective

Enhance user experience and complete remaining frontend functionality, including edit, delete confirmation, and search.

## Actions Taken

- Implemented Edit functionality:
  - Added navigation from Applications table to Create Application page with query parameters.
  - Preloaded existing application data into the form when editing.
  - Reused Create form for both create and update operations.
  - Connected update flow to backend PUT endpoint.

- Implemented Delete confirmation dialog:
  - Replaced browser confirm() with Angular Material dialog.
  - Created reusable ConfirmDialogComponent.
  - Styled dialog to match Figma design (title, message, cancel/confirm buttons).
  - Integrated dialog into ApplicationsComponent delete flow.

- Improved data handling:
  - Enforced unique Application Numbers during creation to prevent unintended bulk deletes.
  - Added input sanitation and validation for numeric fields (amount, terms, monthly payment).
  - Handled backend validation errors and displayed meaningful feedback in UI.

- Improved data display:
  - Converted numeric status values (0, 1, 2) into user-friendly labels (New, Approved, Funded).
  - Formatted Date Applied to display only the date (matching Figma design).
  - Ensured currency formatting for loan amounts.

- Implemented search functionality:
  - Added real-time search input to Applications dashboard.
  - Used MatTableDataSource with custom filterPredicate.
  - Enabled filtering across multiple fields:
    - Application Number
    - Name (First + Last)
    - Email
    - Phone Number
    - Status
    - Loan Amount
    - Date Applied

- Resolved Angular template parsing issues:
  - Fixed invalid TypeScript casting in template using $any().
  - Cleaned up data binding errors after switching to MatTableDataSource.

## Result

The application now supports full CRUD functionality with a polished user interface:

- Create, Read, Update, Delete operations fully functional
- Confirmation dialog for deletes (aligned with design)
- Real-time search across application data
- Clean and user-friendly data presentation

The application closely matches the provided Figma design and demonstrates full-stack integration between Angular and ASP.NET Core.

## What I Learned

- How to reuse Angular forms for both create and update workflows
- How Angular Material dialogs work and how to build reusable components
- How to implement client-side table filtering using MatTableDataSource
- The importance of aligning frontend models with backend validation requirements
- How to debug Angular template parsing errors effectively