import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  // Data is passed in from the parent component (ApplicationsComponent)
  // I chose to assign it manually instead of using MAT_DIALOG_DATA
  public data!: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  };

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  // Close dialog and return false (user canceled)
  cancel(): void {
    this.dialogRef.close(false);
  }

  // Close dialog and return true (user confirmed)
  confirm(): void {
    this.dialogRef.close(true);
  }
}