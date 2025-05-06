
interface LoanTerms {
    Amount: number;
    Terms: number;
}

interface Name {
    First: string;
    Last: string;
}

interface PersonalInformation {
    Name: Name;
    PhoneNumber: string;
    Email: string;
}

export enum ApplicationStatus {
    New = 0,
    Approved = 1,
    Funded = 2
}

export interface LoanApplication {
    ApplicationNumber: string;
    LoanTerms: LoanTerms;
    PersonalInformation: PersonalInformation;
    DateApplied?: Date;
    Status: number;
}

export interface ApplicationBrief {
    ApplicationNumber: string;
    Amount?: number;
    DateApplied?: Date;
    Status: number;
  }