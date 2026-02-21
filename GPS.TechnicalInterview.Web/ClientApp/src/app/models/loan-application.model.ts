export interface LoanApplication {
  applicationNumber: string;
  status: number;
  dateApplied: string; // ISO string
  loanTerms: LoanTerms;
  personalInformation: PersonalInformation;
}

export interface LoanTerms {
  amount: number;
  monthlyPayment: number;
  terms: number;
}

export interface PersonalInformation {
  name: Name;
  phoneNumber: string;
  email: string;
}

export interface Name {
  first: string;
  last: string;
}