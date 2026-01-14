import { Component, Input } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "jt-kpi-card",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./kpi-card.component.html",
})
export class KpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() hint?: string;
}
