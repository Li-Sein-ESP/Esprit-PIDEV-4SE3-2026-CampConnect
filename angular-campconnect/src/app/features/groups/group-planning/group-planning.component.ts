import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, CheckCircle, Clock, Circle, BarChart2, ArrowLeft } from 'lucide-angular';
import { GroupPlanningService } from '../services/group-planning';
import { GroupTask, TaskStatus, GroupDecision, DecisionStatus } from '../models/group.model';

@Component({
    selector: 'app-group-planning',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-planning.component.html',
    styleUrl: './group-planning.component.css'
})
export class GroupPlanningComponent implements OnInit {
    @Input() groupId!: string;

    tasksTodo: GroupTask[] = [];
    tasksInProgress: GroupTask[] = [];
    tasksDone: GroupTask[] = [];

    decisions: GroupDecision[] = [];

    loadingTasks = true;
    loadingDecisions = true;

    // Icons
    readonly Plus = Plus;
    readonly CheckCircle = CheckCircle;
    readonly Clock = Clock;
    readonly Circle = Circle;
    readonly BarChart2 = BarChart2;
    readonly ArrowLeft = ArrowLeft;

    readonly TaskStatus = TaskStatus;

    // New Item States
    showNewTaskForm = false;
    newTaskTitle = '';

    showNewDecisionForm = false;
    newDecisionTitle = '';
    newDecisionOptions = ['', ''];

    constructor(private planningService: GroupPlanningService) { }

    ngOnInit(): void {
        if (this.groupId) {
            this.loadTasks();
            this.loadDecisions();
        }
    }

    loadTasks() {
        this.loadingTasks = true;
        this.planningService.getTasks(this.groupId).subscribe({
            next: (tasks) => {
                this.organizeTasks(tasks || []);
                this.loadingTasks = false;
            },
            error: (err) => {
                console.error("Erreur lors du chargement des tâches", err);
                this.organizeTasks([]);
                this.loadingTasks = false;
            }
        });
    }

    organizeTasks(tasks: GroupTask[]) {
        this.tasksTodo = tasks.filter(t => t.status === TaskStatus.TODO);
        this.tasksInProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
        this.tasksDone = tasks.filter(t => t.status === TaskStatus.DONE);
    }

    loadDecisions() {
        this.loadingDecisions = true;
        this.planningService.getDecisions(this.groupId).subscribe({
            next: (decisions) => {
                this.decisions = decisions || [];
                this.loadingDecisions = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des décisions", err);
                this.decisions = [];
                this.loadingDecisions = false;
            }
        });
    }

    // Task Actions
    addTask() {
        if (!this.newTaskTitle.trim()) return;
        const newTask = {
            title: this.newTaskTitle,
            status: TaskStatus.TODO
        };

        this.planningService.createTask(this.groupId, newTask).subscribe({
            next: (task) => this.tasksTodo.push(task),
            error: (err) => console.error("Erreur d'ajout de la tâche", err)
        });

        this.showNewTaskForm = false;
        this.newTaskTitle = '';
    }

    moveTask(task: GroupTask, newStatus: TaskStatus) {
        const oldStatus = task.status;
        const updatedTask = { ...task, status: newStatus };

        // Optimistic UI Update
        if (oldStatus === TaskStatus.TODO) this.tasksTodo = this.tasksTodo.filter(t => t.id !== task.id);
        else if (oldStatus === TaskStatus.IN_PROGRESS) this.tasksInProgress = this.tasksInProgress.filter(t => t.id !== task.id);
        else if (oldStatus === TaskStatus.DONE) this.tasksDone = this.tasksDone.filter(t => t.id !== task.id);

        if (newStatus === TaskStatus.TODO) this.tasksTodo.push(updatedTask);
        else if (newStatus === TaskStatus.IN_PROGRESS) this.tasksInProgress.push(updatedTask);
        else if (newStatus === TaskStatus.DONE) this.tasksDone.push(updatedTask);

        // Call service
        this.planningService.updateTaskStatus(task.id, updatedTask).subscribe({
            error: (err) => {
                console.error("Erreur de mise à jour de la tâche", err);
                // In a real app we would revert the optimistic UI update here
            }
        });
    }

    // Decision Actions
    castVote(decisionId: string, optionId: string) {
        // Optimistic UI for vote (simulating current user id 'me')
        const decision = this.decisions.find(d => d.id === decisionId);
        if (decision) {
            decision.options.forEach(opt => {
                // remove previous vote if any
                const index = opt.votedByUserIds.indexOf('me');
                if (index > -1) {
                    opt.votedByUserIds.splice(index, 1);
                    opt.votesCount--;
                }
                // add new vote
                if (opt.id === optionId) {
                    opt.votedByUserIds.push('me');
                    opt.votesCount++;
                }
            });
        }

        this.planningService.vote(this.groupId, decisionId, optionId).subscribe();
    }

    percentage(votesCount: number, totalOptions: any[]): number {
        const totalVotes = totalOptions.reduce((acc, curr) => acc + curr.votesCount, 0);
        if (totalVotes === 0) return 0;
        return Math.round((votesCount / totalVotes) * 100);
    }
}
