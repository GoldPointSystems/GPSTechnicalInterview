import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent implements OnInit {

  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];
  public isEditMode = false;
  public applicationNumber: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.applicationForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [null, [Validators.required, Validators.email]],
      applicationNumber: [null, Validators.required],
      status: ['New', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      monthlyPayAmount: [{value: null, disabled: true}],
      terms: [null, [Validators.required, Validators.min(1)]],
    });

    this.applicationForm.get('amount')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    this.applicationForm.get('terms')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
  }

  ngOnInit(): void {
    this.applicationNumber = this.route.snapshot.paramMap.get('id');
    if (this.applicationNumber) {
      this.isEditMode = true;
      this.applicationForm.get('applicationNumber')?.disable();
      this.loadApplication(this.applicationNumber);
    }
  }

  private loadApplication(applicationNumber: string): void {
    this.apiService.getApplications().subscribe(applications => {
      const app = applications.find((a: any) => a.applicationNumber === applicationNumber);
      if (app) {
        this.applicationForm.patchValue({
          firstName: app.personalInformation?.name?.first,
          lastName: app.personalInformation?.name?.last,
          phoneNumber: app.personalInformation?.phoneNumber,
          email: app.personalInformation?.email,
          applicationNumber: app.applicationNumber,
          status: app.status || 'New',
          amount: app.loanTerms?.amount,
          terms: app.loanTerms?.terms,
        });
      }
    });
  }

  private updateMonthlyPayment(): void {
    const amount = this.applicationForm.get('amount')?.value;
    const terms = this.applicationForm.get('terms')?.value;
    if (amount && terms && terms > 0) {
      const monthly = (amount / terms).toFixed(2);
      this.applicationForm.get('monthlyPayAmount')?.setValue(monthly);
    } else {
      this.applicationForm.get('monthlyPayAmount')?.setValue(null);
    }
  }

  save(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    const formValues = this.applicationForm.getRawValue();
    const payload = {
      applicationNumber: formValues.applicationNumber,
      personalInformation: {
        name: {
          first: formValues.firstName,
          last: formValues.lastName
        },
        phoneNumber: formValues.phoneNumber,
        email: formValues.email
      },
      loanTerms: {
        amount: Number(formValues.amount),
        monthlyPayAmount: Number(formValues.monthlyPayAmount),
        terms: Number(formValues.terms)
      },
      status: formValues.status
    };

    if (this.isEditMode) {
      this.apiService.updateApplication(payload).subscribe(() => {
        this.snackBar.open('Saved successfully.', '', { duration: 3000 });
        this.router.navigate(['/applications']);
      });
    } else {
      this.apiService.createApplication(payload).subscribe(() => {
        this.snackBar.open('Created successfully.', '', { duration: 3000 });
        this.router.navigate(['/applications']);
      });
    }
  }
}
