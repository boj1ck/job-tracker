import { Injectable, signal, computed } from "@angular/core";
import { storage } from "../utils/storage";

type Theme = "light" | "dark";
const KEY = "jt_theme";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private _theme = signal<Theme>((storage.get(KEY) as Theme) ?? "dark");

  theme = computed(() => this._theme());

  init() {
    this.apply(this._theme());
  }

  toggle() {
    const next = this._theme() === "dark" ? "light" : "dark";
    this._theme.set(next);
    storage.set(KEY, next);
    this.apply(next);
  }

  private apply(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }
}
