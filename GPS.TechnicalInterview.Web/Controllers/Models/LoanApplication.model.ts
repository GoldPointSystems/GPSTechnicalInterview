// Making a model in TS so that I can translate between the 2 (C# and TS)

export interface LoanTerms {
    amount:number,
    monthlyPaymentAmount: number,
    terms: number,
}

export interface Name {
    first:string,
    last:string
}

export interface PersonalInformation {
    name:Name,
    phoneNumber:string,
    email:string
}

export enum ApplicationStatus {
    New = "New",
    Approved = "Approved",
    Funded = "Funded"
}

export interface LoanApplication {
    applicationNumber: string,
    loanTerms: LoanTerms,
    personalInformation: PersonalInformation,
    dateApplied: Date,
    status: ApplicationStatus
}
