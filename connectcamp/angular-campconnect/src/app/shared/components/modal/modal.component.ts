import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, Inject, Renderer2, ElementRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './modal.component.html',
    styles: [`
    :host {
      display: block;
    }
    .animate-fade-in {
      animation: fade-in 200ms ease-out;
    }
    .animate-scale-in {
      animation: scale-in 200ms ease-out;
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
    @Input() isOpen = false;
    @Input() title = '';
    @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
    @Input() showCloseButton = true;
    @Output() close = new EventEmitter<void>();

    readonly X = X;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        if (this.isOpen) {
            this.lockScroll();
        }
    }

    ngOnDestroy(): void {
        this.unlockScroll();
    }

    // Handle Input changes if isOpen changes dynamically
    ngOnChanges(): void {
        if (this.isOpen) {
            this.lockScroll();
        } else {
            this.unlockScroll();
        }
    }

    @HostListener('window:keydown.escape')
    onEscape() {
        if (this.isOpen) {
            this.close.emit();
        }
    }

    onBackdropClick() {
        this.close.emit();
    }

    private lockScroll() {
        this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    }

    private unlockScroll() {
        this.renderer.removeStyle(this.document.body, 'overflow');
    }

    get sizeClass(): string {
        switch (this.size) {
            case 'sm': return 'max-w-md';
            case 'md': return 'max-w-lg';
            case 'lg': return 'max-w-2xl';
            case 'xl': return 'max-w-4xl';
            default: return 'max-w-lg';
        }
    }
}
