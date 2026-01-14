import { Component, HostListener, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehaviorSubject, combineLatest, map, debounceTime, distinctUntilChanged, startWith, shareReplay } from "rxjs";
import { ApplicationsService } from "../../core/services/applications.service";
import { JobApplication, Stage, WorkMode, AppStatus, Priority } from "../../core/models/application.model";
import { KpiCardComponent } from "../../shared/components/kpi-card/kpi-card.component";
import { SearchBarComponent } from "../../shared/components/search-bar/search-bar.component";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";
import { ModalComponent } from "../../shared/components/modal/modal.component";

type ViewMode = "cards" | "table";
type SortKey = "lastTouchAt" | "appliedAt" | "company" | "stage" | "priority";
type SortDir = "asc" | "desc";

@Component({
  selector: "jt-dashboard",
  standalone: true,
  imports: [CommonModule, KpiCardComponent, SearchBarComponent, SkeletonComponent, ModalComponent],
  templateUrl: "./dashboard.page.html",
})
export class DashboardPage {
  private api = inject(ApplicationsService);

  private search$ = new BehaviorSubject<string>("");
  private stage$ = new BehaviorSubject<Stage | "All">("All");
  private workMode$ = new BehaviorSubject<WorkMode | "All">("All");
  private status$ = new BehaviorSubject<AppStatus | "All">("All");
  private priority$ = new BehaviorSubject<Priority | "All">("All");
  private sortKey$ = new BehaviorSubject<SortKey>("lastTouchAt");
  private sortDir$ = new BehaviorSubject<SortDir>("desc");
  private view$ = new BehaviorSubject<ViewMode>("cards");

  selected: JobApplication | null = null;
  modalOpen = false;

  readonly data$ = this.api.getAll().pipe(shareReplay(1));

  readonly vm$ = combineLatest([
    this.data$,
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), startWith("")),
    this.stage$,
    this.workMode$,
    this.status$,
    this.priority$,
    this.sortKey$,
    this.sortDir$,
    this.view$,
  ]).pipe(
    map(([items, q, stage, mode, status, priority, sortKey, sortDir, view]) => {
      const query = (q ?? "").trim().toLowerCase();

      let filtered = items.filter((x) => {
        const matchesQuery =
          !query ||
          x.company.toLowerCase().includes(query) ||
          x.role.toLowerCase().includes(query) ||
          x.location.toLowerCase().includes(query) ||
          (x.tags ?? []).join(" ").toLowerCase().includes(query);

        const matchesStage = stage === "All" ? true : x.stage === stage;
        const matchesMode = mode === "All" ? true : x.workMode === mode;
        const matchesStatus = status === "All" ? true : x.status === status;
        const matchesPriority = priority === "All" ? true : x.priority === priority;

        return matchesQuery && matchesStage && matchesMode && matchesStatus && matchesPriority;
      });

      const priorityRank: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

      filtered = filtered.sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;

        const av = this.sortValue(a, sortKey, priorityRank);
        const bv = this.sortValue(b, sortKey, priorityRank);

        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });

      const total = items.length;
      const active = items.filter((x) => x.status === "Active").length;
      const interviews = items.filter((x) => x.stage === "Interview" && x.status === "Active").length;
      const offers = items.filter((x) => x.stage === "Offer").length;

      const stale = items.filter((x) => {
        const d = new Date(x.lastTouchAt).getTime();
        const now = Date.now();
        const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        return x.status === "Active" && days >= 7;
      }).length;

      return {
        view,
        sortKey,
        sortDir,
        filters: { stage, mode, status, priority, q },
        kpis: { total, active, interviews, offers, stale },
        items: filtered,
      };
    })
  );

  setSearch(v: string) {
    this.search$.next(v);
  }

  setStage(v: string) {
    this.stage$.next(v as any);
  }

  setWorkMode(v: string) {
    this.workMode$.next(v as any);
  }

  setStatus(v: string) {
    this.status$.next(v as any);
  }

  setPriority(v: string) {
    this.priority$.next(v as any);
  }

  setSortKey(v: string) {
    this.sortKey$.next(v as any);
  }

  toggleSortDir() {
    this.sortDir$.next(this.sortDir$.value === "asc" ? "desc" : "asc");
  }

  setView(v: ViewMode) {
    this.view$.next(v);
  }

  openDetails(item: JobApplication) {
    this.selected = item;
    this.modalOpen = true;
  }

  closeDetails() {
    this.modalOpen = false;
    this.selected = null;
  }

  @HostListener("window:keydown", ["$event"])
  onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && this.modalOpen) this.closeDetails();
  }

  private sortValue(a: JobApplication, key: SortKey, pr: Record<Priority, number>) {
    if (key === "priority") return pr[a.priority];
    if (key === "company") return a.company.toLowerCase();
    if (key === "stage") return a.stage.toLowerCase();
    if (key === "appliedAt") return new Date(a.appliedAt).getTime();
    return new Date(a.lastTouchAt).getTime();
  }

  badgeClass(stage: Stage) {
    const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold";
    if (stage === "Offer") return base + " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    if (stage === "Interview") return base + " bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200";
    if (stage === "Rejected") return base + " bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
    if (stage === "Ghosted") return base + " bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
    return base + " bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";
  }

  priorityPill(p: Priority) {
    const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold";
    if (p === "High") return base + " border-rose-200 text-rose-700 dark:border-rose-900/60 dark:text-rose-200";
    if (p === "Medium") return base + " border-amber-200 text-amber-700 dark:border-amber-900/60 dark:text-amber-200";
    return base + " border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200";
  }

  daysSince(dateISO: string) {
    const d = new Date(dateISO).getTime();
    const now = Date.now();
    const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  money(n?: number) {
    if (!n) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }
}
