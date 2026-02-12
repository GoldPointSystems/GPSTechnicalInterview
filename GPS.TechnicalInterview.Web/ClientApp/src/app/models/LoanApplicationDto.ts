import { LoanTermsDto } from './LoanTermsDto';
import { PersonalInformationDto } from './PersonalInformationDto';
import { ApplicationStatusEnum } from './ApplicationStatusEnum';

export interface LoanApplicationDto {
    applicationNumber: string;
    loanTerms: LoanTermsDto;
    personalInformation: PersonalInformationDto;
    dateApplied: Date;
    applicationStatus: ApplicationStatusEnum;
  }