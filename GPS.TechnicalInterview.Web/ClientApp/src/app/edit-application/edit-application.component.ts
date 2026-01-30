import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-edit-application',
    templateUrl: './edit-application.component.html',
    styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent {

    public applicationForm: FormGroup;
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];
    public dateApplied: Date | null = null;


    mapStatus(status: number): string {
        return this.statuses[status] ?? 'New';
    }

    constructor(private formBuilder: FormBuilder,
        private router: Router,
        private applicationService: ApiService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.applicationForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            applicationNumber: ['', Validators.required],
            status: ['New', Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            monthlyPayAmount: [null],
            terms: [null, [Validators.required, Validators.min(1)]],
        });

        const amountCtrl = this.applicationForm.get('amount');
        const termsCtrl = this.applicationForm.get('terms');

        amountCtrl?.valueChanges.subscribe(() => this.updatePayment());
        termsCtrl?.valueChanges.subscribe(() => this.updatePayment());
    }

    ngOnInit(): void {
        const appNumber = this.route.snapshot.paramMap.get('appNumber');

        this.applicationService.getApplication(appNumber).subscribe({
            next: (app) => {
                this.applicationForm.patchValue({
                    firstName: app.personalInformation?.name?.first,
                    lastName: app.personalInformation?.name?.last,
                    phoneNumber: app.personalInformation?.phone,
                    email: app.personalInformation?.email,
                    applicationNumber: app.applicationNumber,
                    status: this.mapStatus(app.status),
                    amount: app.loanTerms?.amount,
                    monthlyPayAmount: app.loanTerms?.monthlyPaymentAmount,
                    terms: app.loanTerms?.term
                });

                this.dateApplied = app.dateApplied;

            },
            error: (err) => {
                console.error('API error:', err);
            }
        });
    }

    editApplication() {
        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            return;
        }
        const form = this.applicationForm.value;

        const payload = {
            ApplicationNumber: form.applicationNumber,

            LoanTerms: {
                Amount: Number(form.amount),
                MonthlyPaymentAmount: Number(form.monthlyPayAmount),
                Term: Number(form.terms) 
            },

            PersonalInformation: {
                Name: {
                    First: form.firstName,
                    Last: form.lastName
                },
                Phone: form.phoneNumber,
                Email: form.email
            },
            Status: this.statuses.indexOf(form.status),
            DateApplied: this.dateApplied

        };

        this.applicationService.editApplication(payload).subscribe({
            next: (response) => {

                this.snackBar.open('Application edited successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });

                this.router.navigate(['/']);
            },
            error: (err) => {
                console.error('API error:', err);
            }
        });
    }

    private updatePayment() {
        const amount = this.applicationForm.get('amount')?.value;
        const terms = this.applicationForm.get('terms')?.value;

        if (!amount || !terms || terms === 0) {
            this.applicationForm.get('monthlyPayAmount')?.setValue(null, { emitEvent: false });
            return;
        }

        this.applicationForm
            .get('monthlyPayAmount')
            ?.setValue(Math.round((amount / terms) * 100) / 100, { emitEvent: false });
    }

}