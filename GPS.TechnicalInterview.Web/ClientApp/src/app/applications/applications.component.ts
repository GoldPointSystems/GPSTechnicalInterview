import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { LoanApplication } from "../models/loan-application.model";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ConfirmDialogComponent } from "../shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
})
export class ApplicationsComponent implements OnInit {
  // Controls which columns show up in the Angular Material table
  public displayedColumns: Array<string> = [
    "applicationNumber",
    "amount",
    "dateApplied",
    "status",
    "actions",
  ];

  // MatTableDataSource gives us sorting/filtering/search tools for the table
  public dataSource = new MatTableDataSource<LoanApplication>([]);
  public isLoading = false;
  public error: string | null = null;

  // Keep the current search term so we can re-apply it after reloads
  public searchTerm = "";

  constructor(
    private api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Custom search logic: build one searchable string ("haystack") and check if it contains the filter
    // This lets users search by name, app number, status, email, phone, amount, and date.
    this.dataSource.filterPredicate = (app: LoanApplication, filter: string) => {
      const f = (filter ?? "").trim().toLowerCase();
      if (!f) return true;

      // Status is stored as a number in backend, so we convert it to a readable label for search
      const statusLabel = this.getStatusLabel(app.status).toLowerCase();

      const amountStr = String(app?.loanTerms?.amount ?? "").toLowerCase();
      const appNum = String(app?.applicationNumber ?? "").toLowerCase();

      const first = String(app?.personalInformation?.name?.first ?? "").toLowerCase();
      const last = String(app?.personalInformation?.name?.last ?? "").toLowerCase();
      const fullName = `${first} ${last}`.trim();

      const phone = String(app?.personalInformation?.phoneNumber ?? "").toLowerCase();
      const email = String(app?.personalInformation?.email ?? "").toLowerCase();

      // Optional: allow searching by the displayed date text
      const dateStr = app?.dateApplied
        ? new Date(app.dateApplied).toLocaleDateString().toLowerCase()
        : "";

      const haystack = [
        appNum,
        amountStr,
        statusLabel,
        first,
        last,
        fullName,
        phone,
        email,
        dateStr,
      ].join(" ");

      return haystack.includes(f);
    };

    // Load records from backend and bind to the table
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getApplications().subscribe({
      next: (apps) => {
        // Bind backend results to the table
        this.dataSource.data = apps ?? [];
        this.isLoading = false;

        // Re-apply search after refresh so the table doesn't "reset" the filter
        this.applySearch(this.searchTerm);
      },
      error: (err) => {
        console.error(err);
        this.error = "Failed to load applications.";
        this.isLoading = false;
      },
    });
  }

  // Search is client-side filtering using MatTableDataSource.filter
  applySearch(value: string): void {
    this.searchTerm = value ?? "";
    this.dataSource.filter = (this.searchTerm || "").trim().toLowerCase();
  }

  clearSearch(): void {
    this.applySearch("");
  }

  onDelete(app: LoanApplication): void {
    // Use a custom Material dialog (instead of confirm()) to match the Figma UI
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: "520px" });

    // Pass dialog text dynamically so the component stays reusable
    dialogRef.componentInstance.data = {
      title: "Delete Application",
      message: "Are you sure you want to delete this application?",
      cancelText: "CANCEL",
      confirmText: "CONFIRM",
    };

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      // Delete by applicationNumber (acts like an ID for this exercise)
      this.api.deleteApplication(app.applicationNumber).subscribe({
        next: () => this.loadApplications(),
        error: (err) => {
          console.error(err);
          alert("Failed to delete application.");
        },
      });
    });
  }

  onEdit(app: LoanApplication): void {
    // Navigate to the same Create page, but with a query param to trigger edit mode
    this.router.navigate(["/create-application"], {
      queryParams: { id: app.applicationNumber },
    });
  }

  // Convert backend status numbers into readable UI labels
  getStatusLabel(status: number): string {
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
}