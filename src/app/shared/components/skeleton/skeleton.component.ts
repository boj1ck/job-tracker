import { Component, Input } from "@angular/core";
import { NgFor } from "@angular/common";

@Component({
  selector: "jt-skeleton",
  standalone: true,
  imports: [NgFor],
  templateUrl: "./skeleton.component.html",
})
export class SkeletonComponent {
  @Input() lines = 6;

  get rows() {
    return Array.from({ length: this.lines });
  }
}
