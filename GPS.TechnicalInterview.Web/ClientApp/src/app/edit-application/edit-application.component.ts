import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoanApplicationStatus } from "../models/loan-application-status";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LoanApplication } from "../models/loan-application.model";

@Component({
    selector: 'app-edit-application',
    templateUrl: './edit-application.component.html',
    styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent  implements OnInit {
    public applicationEditForm: FormGroup;
     
    public statuses = [
        { label: "New", value: LoanApplicationStatus.New },
        { label: "Approved", value: LoanApplicationStatus.Approved },
        { label: "Funded", value: LoanApplicationStatus.Funded }
    ];
    private applicationNumber: string = "";
    private originalDateApplied: string = ""; // To track original data for change detection

    constructor(
        private formBulder: FormBuilder,
        private apiService: ApiService,
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.applicationEditForm = this.formBulder.group({
            firstName: [null, [Validators.required]],
            lastName: [null, [Validators.required]],
            phoneNumber: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
            email: [null, [Validators.required, Validators.email]],
            applicationNumber: [{ value: null, disabled: true }, [Validators.required]],
            status: [LoanApplicationStatus.New, [Validators.required]],
            amount: [null, [Validators.required, Validators.min(1)]],
            monthlyPaymentAmount: [null, [Validators.required, Validators.min(1)]],
            term: [null, [Validators.required, Validators.min(1)]],
        });
    }
    ngOnInit(): void {
        this.applicationNumber = this.route.snapshot.params['applicationNumber'];
        this.loadApplication();
    }

    loadApplication(): void {
        this.apiService.getApplication(this.applicationNumber).subscribe({
            next: (application: LoanApplication) => {
                this.applicationEditForm.patchValue({
                    firstName: application.personalInformation?.name.first,
                    lastName: application.personalInformation?.name.last,
                    phoneNumber: application.personalInformation?.phoneNumber,
                    email: application.personalInformation?.email,

                    applicationNumber: application.applicationNumber,
                    status: application.status,

                    amount: application.loanTerms?.amount,
                    monthlyPaymentAmount: application.loanTerms?.monthlyPaymentAmount,
                    term: application.loanTerms?.term
                });
                this.originalDateApplied = application.dateApplied; // Store the original date applied
            },
            error: (error: unknown) => {
                console.log('Error fetching application:', error);
                this.snackBar.open('Failed to load application.', 'Close', { duration: 3000 });
            }
        });
    }
    
    updateApplication(): void {
        if (this.applicationEditForm.invalid) {
            this.applicationEditForm.markAllAsTouched();
            this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
            return;
        }

        const v = this.applicationEditForm.getRawValue(); // getRawValue to include disabled fields like applicationNumber
        const payload: LoanApplication = {
            applicationNumber: v.applicationNumber,
            personalInformation: {
                name: {
                    first: v.firstName,
                    last: v.lastName
                },
                phoneNumber: String(v.phoneNumber),
                email: v.email
            },
            loanTerms: {
                amount: Number(v.amount),
                monthlyPaymentAmount: Number(v.monthlyPaymentAmount),
                term: Number(v.term)
            },
            status: v.status,
            dateApplied: this.originalDateApplied // Preserve the original date applied
        };

        this.apiService.updateApplication(this.applicationNumber, payload).subscribe({
            next: (response: any) => {
                this.snackBar.open(response?.message || 'Application updated successfully.', 'Close', { duration: 3000 });
                this.router.navigate(['/applications']);
            },
            error: (error: any) => {
                console.error("Error updating application:", error);
                this.snackBar.open(error.error?.message || 'Failed to update application. Please try again.', 'Close', { duration: 3000 });
            }
        });
    }
}