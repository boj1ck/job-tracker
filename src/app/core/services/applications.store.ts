import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, of, tap } from "rxjs";
import { ApplicationsService } from "./applications.service";
import { JobApplication } from "../models/application.model";

@Injectable({ providedIn: "root" })
export class ApplicationsStore {
  private _items = new BehaviorSubject<JobApplication[]>([]);
  items$ = this._items.asObservable();

  constructor(private api: ApplicationsService) {}

  load() {
    return this.api.getAll().pipe(
      tap((x) => this._items.next(x ?? [])),
      catchError(() => {
        this._items.next([]);
        return of([]);
      })
    );
  }

  snapshot() {
    return this._items.value;
  }

  upsert(app: JobApplication) {
    const all = this._items.value.slice();
    const i = all.findIndex((x) => x.id === app.id);
    if (i >= 0) all[i] = app;
    else all.unshift(app);
    this._items.next(all);
  }

  remove(id: string) {
    this._items.next(this._items.value.filter((x) => x.id !== id));
  }

  allTagsSnapshot() {
    const set = new Set<string>();
    for (const a of this._items.value) for (const t of a.tags ?? []) set.add(t);
    return Array.from(set);
  }
}
