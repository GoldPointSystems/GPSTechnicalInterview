import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ApplicationStatus, LoanApplication } from "../../../Controllers/Models/LoanApplication.model"
import { LoaderContext } from "webpack";
@Injectable({ providedIn: 'root' })
export class ApiService {
    private applications: LoanApplication[] = [];
    private applicationsSubject = new BehaviorSubject<LoanApplication[]>(this.applications);

    // If they are giving me an HttpClient parameter does that mean they want me to set up a database? 
    // Make some api call perhaps
    constructor(private http: HttpClient) { }

    // Add an application manually to see if it shows. 
    // If it shows then I am not mapping correctly.
    // constructor() {
    //     this.applications.push({
    //         ApplicationNumber: '12345',
    //         LoanTerms: { Amount: 5000 },
    //         PersonalInformation: {
    //             Name: { First: 'John', Last: 'Doe' },
    //             PhoneNumber: '123-456-7890',
    //             Email: 'johndoe@example.com'
    //         },
    //         DateApplied: new Date(),
    //         Status: ApplicationStatus.New,
    //     } as LoanApplication);
    //     this.applicationsSubject.next([...this.applications]);
    // }

    // Everything is local so I have to think of a way to store everything locally. Maybe use an array or some data structure
    // ORRRRR, I could set up MongoDB since that is what they are using in their stack. <- If I have time I should do this

    // Observables are like a promise. Angular's HttpClient returns Obsevable by default. Makes sense to use them over Promise.
    createApplication(application: LoanApplication): Observable<LoanApplication> {
        // this.applications.push(application);

        // Need this part to update the front end in real time (when going back to the applications window)
        // this.applicationsSubject.next([...this.applications]);

        // return of(application);

        //Now this should call the endpoint
        return this.http.post<LoanApplication>('https://localhost:5001/ApplicationManager/CreateApplication', application);
    }

    getAllApplications(): Observable<LoanApplication[]> {
        // console.log("Returning applications:", this.applications);
        // return this.applicationsSubject.asObservable();
        var p = this.http.get<LoanApplication[]>("https://localhost:5001/ApplicationManager/all");
        p.subscribe(data => {
            console.log("data: ", data); // This will show the actual data, not the Observable
        });
        return p;
    }

    deleteApplication(applicationNumber: string): Observable<void> {
        // this.applications = this.applications.filter(app => app.ApplicationNumber !== applicationNumber);

        // // Need this to update the front end in real time.
        // this.applicationsSubject.next([...this.applications]);
        // return of();


        return this.http.delete<void>(`https://localhost:5001/ApplicationManager/delete-application/${applicationNumber}`);
    }

    updateApplication(applicationNumber: string, updatedApplication: LoanApplication): Observable<LoanApplication> {
        // const index = this.applications.findIndex(app => app.ApplicationNumber === applicationNumber);
        // // console.log("index", index);

        // if (index !== -1) {
        //     this.applications[index] = updatedApplication;
        //     this.applicationsSubject.next([...this.applications]);
        // }

        // // console.log("Updated application", updatedApplication);
        // // console.log("Applications ", this.applications);

        // return of(updatedApplication);
        // console.log("Updating application number:", applicationNumber);
        // console.log("Updated application data:", updatedApplication);

        // This works through postman but not through the UI.
        return this.http.put<LoanApplication>(`https://localhost:5001/ApplicationManager/update/${applicationNumber}`, updatedApplication);
    }

}