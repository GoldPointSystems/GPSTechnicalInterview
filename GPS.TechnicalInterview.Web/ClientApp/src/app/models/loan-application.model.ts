import { LoanTerms } from "./loan-terms.model";
import { PersonalInformation } from "./personal-infomation.model";
import { LoanApplicationStatus } from "./loan-application-status";

export interface LoanApplication {
    applicationNumber: string;
    loanTerms: LoanTerms;
    personalInformation: PersonalInformation;
    dateApplied: string; // DateTime from backend serialized as string
    status: LoanApplicationStatus;
}