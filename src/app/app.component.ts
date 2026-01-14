import { Component, inject, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);

  ngOnInit() {
    this.theme.init();
  }

  toggleTheme() {
    this.theme.toggle();
  }
}
