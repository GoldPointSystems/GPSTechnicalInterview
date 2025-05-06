import { Injectable, signal } from "@angular/core";
import { LoanApplication } from "./LoanApplication.model";

@Injectable({providedIn: 'root'})
export class DataService {
    private applicationNumber = signal('');

    setApplicationNumber (an: string) {
        this.applicationNumber.set(an);
    }

    getApplicationNumber () {
        return this.applicationNumber();
    }
}