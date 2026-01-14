import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "jt-modal",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./modal.component.html",
})
export class ModalComponent {
  @Input({ required: true }) open!: boolean;
  @Input() title = "Details";
  @Output() close = new EventEmitter<void>();

  onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset["backdrop"] === "1") this.close.emit();
  }
}
