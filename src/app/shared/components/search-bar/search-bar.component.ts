import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "jt-search-bar",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./search-bar.component.html",
})
export class SearchBarComponent {
  @Input() placeholder = "Search…";
  @Input() value = "";
  @Output() valueChange = new EventEmitter<string>();

  onInput(v: string) {
    this.valueChange.emit(v);
  }
}
