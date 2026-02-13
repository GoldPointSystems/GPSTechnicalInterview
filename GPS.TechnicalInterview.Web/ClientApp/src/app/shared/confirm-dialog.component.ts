import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


export interface ConfirmDialogData {
    title: string;
    message: string;
}

@Component({
    selector: 'app-confirm-dialog',
    template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="warn" (click)="onConfirm()">Delete</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {

    dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
    data = inject(MAT_DIALOG_DATA) as ConfirmDialogData;

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}