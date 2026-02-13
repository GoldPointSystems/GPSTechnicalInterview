import { LoanTerms } from "./loan-terms.model";
import { PersonalInformation } from "./personal-infomation.model";
import { LoanApplicationStatus } from "./loan-application-status";

export interface LoanApplication {
    id: string;
    loanTerms: LoanTerms;
    personalInformation: PersonalInformation;
    dateTime: string;
    status: LoanApplicationStatus;
}