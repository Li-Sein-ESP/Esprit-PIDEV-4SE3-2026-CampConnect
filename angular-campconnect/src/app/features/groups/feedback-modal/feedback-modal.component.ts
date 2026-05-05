import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripFeedbackService } from '../services/trip-feedback.service';
import { LucideAngularModule, X, Star, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent implements OnInit {
  @Input() tripIntentId!: string;
  @Input() groupId!: string;
  @Input() membersToEvaluate: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() feedbackSubmitted = new EventEmitter<void>();

  currentIndex = 0;
  isSubmitting = false;

  readonly X = X;
  readonly Star = Star;
  readonly MessageSquare = MessageSquare;

  currentFeedback = {
    opennessScore: 5,
    conscientiousnessScore: 5,
    extraversionScore: 5,
    agreeablenessScore: 5,
    neuroticismScore: 5,
    isCompatible: true
  };

  constructor(
    private feedbackService: TripFeedbackService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  get currentMember(): any | null {
    if (this.currentIndex < this.membersToEvaluate.length) {
      return this.membersToEvaluate[this.currentIndex];
    }
    return null;
  }

  resetForm() {
    this.currentFeedback = {
      opennessScore: 5,
      conscientiousnessScore: 5,
      extraversionScore: 5,
      agreeablenessScore: 5,
      neuroticismScore: 5,
      isCompatible: true
    };
  }

  setScore(trait: string, value: number) {
    (this.currentFeedback as any)[trait] = value;
  }

  submitCurrentFeedback() {
    if (!this.currentMember || this.isSubmitting) return;
    
    this.isSubmitting = true;

    const finalPayload = {
      tripIntentId: this.tripIntentId,
      groupId: this.groupId,
      evaluatorUserId: '',
      evaluatedUserId: this.currentMember.id,
      opennessScore: this.currentFeedback.opennessScore,
      conscientiousnessScore: this.currentFeedback.conscientiousnessScore,
      extraversionScore: this.currentFeedback.extraversionScore,
      agreeablenessScore: this.currentFeedback.agreeablenessScore,
      neuroticismScore: this.currentFeedback.neuroticismScore,
      isCompatible: this.currentFeedback.isCompatible
    };

    console.log('Envoi du feedback pour:', this.currentMember.id, finalPayload);

    this.feedbackService.leaveFeedback(finalPayload as any).subscribe({
      next: (res) => {
        console.log('Feedback envoyé avec succès', res);
        this.isSubmitting = false;
        this.currentIndex++;
        if (this.currentIndex < this.membersToEvaluate.length) {
          this.resetForm();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Échec de l\'envoi du feedback', err);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        alert("Erreur Serveur : Impossible d'enregistrer votre avis. Vérifiez la connexion au backend.");
      }
    });
  }

  closeModal() {
    if (this.currentIndex > 0) {
      // Meaning they submitted at least one feedback, refresh the list on close.
      this.feedbackSubmitted.emit();
    }
    this.close.emit();
  }
}
