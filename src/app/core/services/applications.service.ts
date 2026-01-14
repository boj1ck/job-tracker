import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, Observable } from "rxjs";
import { JobApplication } from "../models/application.model";

@Injectable({ providedIn: "root" })
export class ApplicationsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<JobApplication[]> {
    return this.http
.get<JobApplication[]>("assets/data/applications.json")
      .pipe(delay(550));
  }
}
