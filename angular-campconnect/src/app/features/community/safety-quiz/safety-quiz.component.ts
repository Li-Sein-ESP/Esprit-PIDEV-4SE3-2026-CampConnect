import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/components/button.component';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

@Component({
  selector: 'app-safety-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './safety-quiz.component.html',
  styles: [`
    .quiz-container { max-width: 600px; margin: 40px auto; padding: 20px; }
    .option-btn { width: 100%; text-align: left; padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s; background: white; }
    .option-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
    .option-btn.selected { background: #eff6ff; border-color: #3b82f6; }
    .explanation { padding: 15px; background: #f0fdf4; border-left: 4px solid #16a34a; margin-top: 20px; border-radius: 4px; }
  `]
})
export class SafetyQuizComponent implements OnInit {
  questions: Question[] = [
    {
      id: 1,
      text: "Laquelle de ces photos est strictement interdite sur le fil d'actualité de CampConnect ?",
      options: [
        "Une photo de mon campement sous la pluie.",
        "Une photo montrant un objet dangereux (arme, couteau de combat) ou de la drogue.",
        "Une photo de mon sac à dos de randonnée."
      ],
      correctAnswer: 1,
      explanation: "Notre IA scanne chaque image pour garantir un environnement familial et sécurisé. Les objets dangereux sont proscrits."
    },
    {
      id: 2,
      text: "Si je ne suis pas d'accord avec le commentaire d'un autre campeur, que dois-je faire ?",
      options: [
        "L'insulter ou utiliser un langage agressif.",
        "Ignorer le commentaire ou exprimer mon désaccord avec politesse.",
        "Publier ses informations personnelles pour me venger."
      ],
      correctAnswer: 1,
      explanation: "Le respect mutuel est la base de la communauté CampConnect. Le harcèlement n'est pas toléré."
    },
    {
      id: 3,
      text: "Pourquoi mon texte a-t-il été rejeté par le générateur d'histoires automatique ?",
      options: [
        "Parce que j'ai écrit trop de détails intéressants.",
        "Parce que mon texte contenait des caractères aléatoires sans sens (Gibberish) ou du contenu inapproprié.",
        "Parce que j'ai écrit en français."
      ],
      correctAnswer: 1,
      explanation: "Pour générer une belle histoire, l'IA a besoin d'une description réelle et de qualité."
    }
  ];

  currentStep = 0; // 0: Start, 1: Quiz, 2: Result, 3: Permanently Blocked
  currentQuestionIndex = 0;
  selectedOption: number | null = null;
  score = 0;
  isCorrect: boolean | null = null;
  loading = false;
  isPermanentlyBanned = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.profileDetails?.['moderationStatus'] === 'PERMANENTLY_BANNED') {
      this.isPermanentlyBanned = true;
      this.currentStep = 3; // Écran de blocage définitif

      // 🧨 AUTO-PURGE : On supprime réellement le compte en base de données
      this.http.delete(`${environment.apiUrl}/community/safety/purge/${user.id}`).subscribe({
        next: () => {
          console.warn('CRITICAL: Compte supprimé réellement de la BDD.');
        },
        error: (err) => console.error('Erreur lors de la purge :', err)
      });
    }
  }

  startQuiz() {
    this.currentStep = 1;
  }

  selectOption(index: number) {
    if (this.isCorrect !== null) return;
    this.selectedOption = index;
  }

  checkAnswer() {
    if (this.selectedOption === null) return;
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    this.isCorrect = this.selectedOption === currentQuestion.correctAnswer;
    
    if (this.isCorrect) {
      this.score++;
    }
  }

  nextQuestion() {
    this.selectedOption = null;
    this.isCorrect = null;
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.currentStep = 2;
    }
  }

  submitRehabilitation() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.loading = true;
    this.http.put(`${environment.apiUrl}/community/safety/rehabilitate/${user.id}`, {}).subscribe({
      next: () => {
        // Mettre à jour l'utilisateur localement
        if (user.profileDetails) {
          user.profileDetails['moderationStatus'] = 'ACTIVE';
          this.authService.updateCurrentUser(user);
        }
        this.loading = false;
        this.router.navigate(['/community/feed']);
      },
      error: () => {
        this.loading = false;
        alert("Erreur lors de la réactivation. Contactez un admin.");
      }
    });
  }
}
