import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { LoanApplication } from '../models/loan-application';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent implements OnInit, OnDestroy {

  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];
  public isEditMode: boolean = false;
  public applicationNumber: string = '';

  private subscriptions: Subscription = new Subscription();
  private initialFormValue: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.applicationForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      applicationNumber: [null, [Validators.required, Validators.pattern('^[0-9]{6}-[0-9]{4}$')]],
      status: ['New'],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      monthlyPayAmount: [{value: null, disabled: true}],
      term: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    // Listen for amount or term changes to recalculate monthly payment
    const amountSub = this.applicationForm.get('amount')!.valueChanges.subscribe(() => {
      this.calculateMonthlyPayment();
    });
    const termSub = this.applicationForm.get('term')!.valueChanges.subscribe(() => {
      this.calculateMonthlyPayment();
    });
    this.subscriptions.add(amountSub);
    this.subscriptions.add(termSub);

    // Check if we're in edit mode
    const appNum = this.route.snapshot.paramMap.get('applicationNumber');
    if (appNum) {
      this.isEditMode = true;
      this.applicationNumber = appNum;
      this.applicationForm.get('applicationNumber')!.disable();
      this.loadApplication(appNum);
    } else {
      this.initialFormValue = this.applicationForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadApplication(applicationNumber: string): void {
    this.apiService.getApplication(applicationNumber).subscribe(app => {
      this.applicationForm.patchValue({
        firstName: app.personalInformation.name.first,
        lastName: app.personalInformation.name.last,
        phoneNumber: app.personalInformation.phoneNumber,
        email: app.personalInformation.email,
        applicationNumber: app.applicationNumber,
        status: app.status,
        amount: app.loanTerms.amount,
        term: app.loanTerms.term,
      });
      this.calculateMonthlyPayment();
      this.initialFormValue = this.applicationForm.getRawValue();
    });
  }

  private calculateMonthlyPayment(): void {
    const amount = this.applicationForm.get('amount')!.value;
    const term = this.applicationForm.get('term')!.value;
    if (amount && term && term > 0) {
      const monthly = (amount / term).toFixed(2);
      this.applicationForm.get('monthlyPayAmount')!.setValue(monthly);
    } else {
      this.applicationForm.get('monthlyPayAmount')!.setValue(null);
    }
  }

  private buildPayload(): LoanApplication {
    const form = this.applicationForm.getRawValue();
    return {
      applicationNumber: form.applicationNumber,
      loanTerms: {
        amount: parseFloat(form.amount),
        monthlyPaymentAmount: parseFloat(form.monthlyPayAmount) || 0,
        term: parseInt(form.term, 10),
      },
      personalInformation: {
        name: {
          first: form.firstName,
          last: form.lastName,
        },
        phoneNumber: form.phoneNumber,
        email: form.email,
      },
      status: form.status,
    } as LoanApplication;
  }

  hasUnsavedChanges(): boolean {
    const current = JSON.stringify(this.applicationForm.getRawValue());
    const initial = JSON.stringify(this.initialFormValue);
    return current !== initial;
  }

  onBack(): void {
    if (this.hasUnsavedChanges()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Are you sure you want to leave?',
          confirmText: 'Leave'
        }
      });
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.router.navigate(['/applications']);
        }
      });
    } else {
      this.router.navigate(['/applications']);
    }
  }

  onNumericKeypress(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onApplicationNumberInput(): void {
    const control = this.applicationForm.get('applicationNumber')!;
    let value = (control.value || '').replace(/[^0-9]/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    if (value.length > 6) {
      value = value.substring(0, 6) + '-' + value.substring(6);
    }
    control.setValue(value, { emitEvent: false });
  }

  onSave(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    if (this.isEditMode) {
      this.apiService.updateApplication(payload).subscribe({
        next: () => {
          this.snackBar.open('Saved successfully.', 'ok', { duration: 6000 });
          this.router.navigate(['/applications']);
        },
        error: () => {
          this.snackBar.open('Error saving application.', 'ok', { duration: 6000 });
        }
      });
    } else {
      this.apiService.createApplication(payload).subscribe({
        next: () => {
          this.snackBar.open('Created successfully.', 'ok', { duration: 6000 });
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          const msg = err.status === 409 ? 'An application with this number already exists.' : 'Error creating application.';
          this.snackBar.open(msg, 'ok', { duration: 6000 });
        }
      });
    }
  }
}
