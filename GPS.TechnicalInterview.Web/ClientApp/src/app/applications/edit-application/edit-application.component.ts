import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoanApplicationDto } from '../../models/LoanApplicationDto';
import { ApplicationStatusEnum } from '../../models/ApplicationStatusEnum';

@Component({
    selector: 'app-edit-application',
    templateUrl: './edit-application.component.html',
    styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent {

    public applicationForm: FormGroup;
    public statuses = ApplicationStatusEnum.getKeys();
    public applicationNumber!: string;
    private applicationData?: LoanApplicationDto;
    public isLoading = false;

    constructor(private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private snackBar: MatSnackBar) {
        this.applicationForm = this.buildForm();
    }

    ngOnInit() {
        const param = this.route.snapshot.paramMap.get('applicationNumber');
        if (!param) {
            this.router.navigate(['/app-applications']);
            this.snackBar.open('Invalid application number', 'Close', { duration: 2000 });
            return;
        }

        this.applicationNumber = param;

        this.apiService.getApplication(this.applicationNumber.toString()).subscribe({
            next: (data: LoanApplicationDto) => {
                this.applicationData = data;
                this.applicationForm.patchValue({
                    firstName: data.personalInformation.name.firstName,
                    lastName: data.personalInformation.name.lastName,
                    phoneNumber: data.personalInformation.phoneNumber,
                    email: data.personalInformation.email,
                    applicationNumber: data.applicationNumber,
                    status: data.applicationStatus,
                    amount: data.loanTerms.amount,
                    monthlyPayAmount: data.loanTerms.monthlyPaymentAmount,
                    terms: data.loanTerms.term
                });
            },
            error: (err) => {
                console.error('Error fetching application:', err);
                this.router.navigate(['/app-applications']);
                this.snackBar.open('Failed to load application', 'Close', { duration: 2000 });
            }
        });

        // Listen for changes to the phone number field and format it as the user types (Don't allow non-numeric characters and limit to 10 digits).
        this.applicationForm.get('phone')?.valueChanges.subscribe(value => {
            if (value) {
                const cleaned = value.replace(/\D/g, '').slice(0, 10);
                this.applicationForm.get('phone')?.setValue(cleaned, { emitEvent: false });
            }
        });

        // recalculate monthly payment amount whenever amount or terms change
        this.applicationForm.valueChanges.subscribe(values => {
            if (!values) {
                return;
            }

            const amount = Number(values.amount || 0);
            const term = Number(values.terms || 0);

            const monthlyControl = this.applicationForm.get('monthlyPayAmount');
            if (!monthlyControl) {
                return;
            }

            if (amount > 0 && term > 0) {
                const monthly = (amount / term).toFixed(2);

                if (monthlyControl.value !== monthly) {
                    monthlyControl.setValue(monthly, { emitEvent: false });
                }
            } else {
                monthlyControl.setValue('', { emitEvent: false });
            }
        });
    }

    onSubmit() {
        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.applicationForm.disable();

        const newApplication: LoanApplicationDto = {
            applicationNumber: this.applicationForm.value.applicationNumber,
            loanTerms: {
                amount: this.applicationForm.value.amount,
                monthlyPaymentAmount: this.applicationForm.value.monthlyPayAmount,
                term: this.applicationForm.value.terms
            },
            personalInformation: {
                name: {
                    firstName: this.applicationForm.value.firstName,
                    lastName: this.applicationForm.value.lastName,
                },
                phoneNumber: this.applicationForm.value.phoneNumber,
                email: this.applicationForm.value.email
            },
            dateApplied: this.applicationData!.dateApplied,
            applicationStatus: this.applicationForm.value.status
        }

        this.apiService.updateApplication(newApplication).subscribe({
            next: () => {
                this.snackBar.open('Edit Saved Successfully', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                this.router.navigate(['/app-applications']);
            },
            error: (err) => {
                console.error('Error updating application:', err);
                this.snackBar.open('Failed to update application', 'Close', {
                    duration: 2000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            },
            complete: () => {
                this.isLoading = false;
                this.applicationForm.enable();
            }
        });
    }

    // Convenience getter for easy access to form fields in the template
    get f() {
        return this.applicationForm.controls;
    }

    buildForm(): FormGroup {
        return this.formBuilder.group({
            firstName: [null, Validators.required],
            lastName: [null, Validators.required],
            //Phone number should be exactly 10 digits and only allow numeric input.
            phoneNumber: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
            email: [null, [Validators.required, Validators.email]],
            applicationNumber: [null, Validators.required],
            status: ['New', Validators.required],
            // Amount should be a positive number with up to two decimal places.
            amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
            monthlyPayAmount: [null],
            terms: [null, Validators.required],
        });
    }
}
