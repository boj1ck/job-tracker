import { Routes } from "@angular/router";
import { DashboardPage } from "./features/dashboard/dashboard.page";
import { AboutPage } from "./features/about/about.page";

export const routes: Routes = [
  { path: "", component: DashboardPage },
  { path: "about", component: AboutPage },
  { path: "**", redirectTo: "" },
];
