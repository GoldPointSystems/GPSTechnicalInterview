export interface LoanApplication {
  applicationNumber: string;
  loanTerms: LoanTerms;
  personalInformation: PersonalInformation;
  dateApplied?: string;
  status: string;
}

export interface LoanTerms {
  amount: number;
  monthlyPaymentAmount: number;
  term: number;
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
