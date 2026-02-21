import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../api.service";
import { LoanApplication } from "../models/loan-application.model";

@Component({
  selector: "app-create-application",
  templateUrl: "./create-application.component.html",
  styleUrls: ["./create-application.component.scss"],
})
export class CreateApplicationComponent {
  public applicationForm: FormGroup;

  // UI-friendly status labels (backend stores these as numbers/enums)
  public statuses: Array<string> = ["New", "Approved", "Funded"];

  // Simple UI state flags for loading/saving + showing errors
  public isSaving = false;
  public isLoading = false;
  public error: string | null = null;

  // Same form is used for both Create and Edit (edit mode is triggered by query param)
  public isEditMode = false;
  private editingId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Reactive form so we can validate and build the payload for the backend cleanly
    this.applicationForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      applicationNumber: [null, Validators.required],
      status: ["New", Validators.required],
      amount: [null, Validators.required],
      monthlyPayAmount: [null],
      terms: [null, Validators.required],
    });

    // Edit mode example: /create-application?id=1234
    // If "id" exists, load existing data and lock the identifier.
    this.route.queryParams.subscribe((params) => {
      const id = params["id"];
      if (id) {
        this.isEditMode = true;
        this.editingId = String(id);
        this.loadForEdit(this.editingId);
      } else {
        this.isEditMode = false;
        this.editingId = null;

        // In create mode, allow user to enter application number
        this.applicationForm.get("applicationNumber")?.enable();
      }
    });
  }

  // Convert UI status string into backend enum number
  private statusToNumber(status: string): number {
    switch (status) {
      case "Approved":
        return 1;
      case "Funded":
        return 2;
      case "New":
      default:
        return 0;
    }
  }

  // Convert backend enum number into UI-friendly string
  private statusNumberToString(status: number): string {
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Funded";
      case 0:
      default:
        return "New";
    }
  }

  // Clean money inputs so users can type "$10,000" and it still works
  private toMoneyNumber(value: any): number {
    const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
    return Number(cleaned);
  }

  // Load existing application data for edit mode
  // (This uses GetApplications since the backend doesn't have GetById)
  private loadForEdit(applicationNumber: string): void {
    this.error = null;
    this.isLoading = true;

    this.api.getApplications().subscribe({
      next: (apps) => {
        const app = (apps ?? []).find((a) => a.applicationNumber === applicationNumber);

        if (!app) {
          this.error = `Could not find application '${applicationNumber}'.`;
          this.isLoading = false;
          return;
        }

        // Fill the form with existing values (edit experience)
        this.applicationForm.patchValue({
          firstName: app.personalInformation?.name?.first ?? "",
          lastName: app.personalInformation?.name?.last ?? "",
          phoneNumber: app.personalInformation?.phoneNumber ?? "",
          email: app.personalInformation?.email ?? "",
          applicationNumber: app.applicationNumber,
          status: this.statusNumberToString(app.status),
          amount: app.loanTerms?.amount ?? null,
          monthlyPayAmount: app.loanTerms?.monthlyPayment ?? null,
          terms: app.loanTerms?.terms ?? null,
        });

        // Prevent changing primary identifier during edit (keeps updates safe)
        this.applicationForm.get("applicationNumber")?.disable();

        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load application for edit:", err);
        this.error = "Failed to load application for editing.";
        this.isLoading = false;
      },
    });
  }

  onSave(): void {
    this.error = null;

    // Frontend validation first, so we don't spam the API with bad requests
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.error = "Please fill out all required fields.";
      return;
    }

    // IMPORTANT: getRawValue() includes disabled fields (applicationNumber is disabled in edit mode)
    const v = this.applicationForm.getRawValue();

    // These conversions prevent ASP.NET model-binding errors (400s) from strings vs numbers
    const terms = parseInt(String(v.terms ?? "").trim(), 10);
    if (!Number.isFinite(terms) || terms <= 0) {
      this.error = "Terms must be a whole number greater than 0.";
      return;
    }

    const amount = this.toMoneyNumber(v.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.error = "Amount must be a number greater than 0.";
      return;
    }

    const monthlyPayment = this.toMoneyNumber(v.monthlyPayAmount ?? 0);
    if (!Number.isFinite(monthlyPayment) || monthlyPayment < 0) {
      this.error = "Monthly payment must be a valid number.";
      return;
    }

    // Build payload to match the backend LoanApplication model shape
    const payload: LoanApplication = {
      applicationNumber: String(v.applicationNumber ?? "").trim(),
      status: this.statusToNumber(v.status),

      // Backend overwrites DateApplied on create; on update, backend keeps original
      dateApplied: new Date().toISOString(),

      loanTerms: { amount, monthlyPayment, terms },
      personalInformation: {
        name: {
          first: String(v.firstName ?? "").trim(),
          last: String(v.lastName ?? "").trim(),
        },
        phoneNumber: String(v.phoneNumber ?? "").trim(),
        email: String(v.email ?? "").trim(),
      },
    };

    this.isSaving = true;

    // Use same button for create/update depending on mode
    const request$ =
      this.isEditMode && this.editingId
        ? this.api.updateApplication(this.editingId, payload)
        : this.api.createApplication(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(["/applications"]);
      },
      error: (err) => {
        console.error(this.isEditMode ? "Update failed:" : "Create failed:", err);
        this.isSaving = false;

        // Show useful errors (either a plain message or validation details)
        if (typeof err?.error === "string") {
          this.error = err.error;
        } else if (err?.error?.errors) {
          this.error = JSON.stringify(err.error.errors, null, 2);
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = `Failed to ${this.isEditMode ? "update" : "save"} application (${err?.status ?? "?"}).`;
        }
      },
    });
  }
}