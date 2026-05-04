import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, CheckCircle, Circle, BarChart2, Trash2 } from 'lucide-angular';
import { GroupTaskService, GroupTask } from '../services/group-task.service';

@Component({
    selector: 'app-group-planning',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-planning.component.html',
    styleUrl: './group-planning.component.css'
})
export class GroupPlanningComponent implements OnInit {
    @Input() groupId!: string;

    pendingTasks: GroupTask[] = [];
    completedTasks: GroupTask[] = [];

    loadingTasks = true;

    // Icons
    readonly Plus = Plus;
    readonly CheckCircle = CheckCircle;
    readonly Circle = Circle;
    readonly BarChart2 = BarChart2;
    readonly Trash2 = Trash2;

    showNewTaskForm = false;
    newTaskTitle = '';

    constructor(private taskService: GroupTaskService) { }

    ngOnInit(): void {
        if (this.groupId) {
            this.loadTasks();
        }
    }

    loadTasks() {
        this.loadingTasks = true;
        this.taskService.getTasksByGroupId(this.groupId).subscribe({
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
        this.pendingTasks = tasks.filter(t => !t.isCompleted);
        this.completedTasks = tasks.filter(t => t.isCompleted);
    }

    addTask() {
        if (!this.newTaskTitle.trim() || !this.groupId) return;
        
        const newTask: GroupTask = {
            groupId: this.groupId,
            title: this.newTaskTitle,
            isCompleted: false
        };

        this.taskService.createTask(newTask).subscribe({
            next: (task) => {
                this.pendingTasks.push(task);
            },
            error: (err) => console.error("Erreur d'ajout de la tâche", err)
        });

        this.showNewTaskForm = false;
        this.newTaskTitle = '';
    }

    toggleTask(task: GroupTask) {
        if (!task.id) return;
        const previousState = task.isCompleted;
        const newState = !previousState;
        
        // Optimistic update
        task.isCompleted = newState;
        this.organizeTasks([...this.pendingTasks, ...this.completedTasks]);

        this.taskService.updateTask(task.id, { isCompleted: newState }).subscribe({
            error: (err) => {
                console.error("Erreur de mise à jour", err);
                // Revert
                task.isCompleted = previousState;
                this.organizeTasks([...this.pendingTasks, ...this.completedTasks]);
            }
        });
    }

    deleteTask(task: GroupTask) {
        if (!task.id) return;
        
        if(confirm('Supprimer cette tâche ?')) {
            const id = task.id;
            // Optimistic deletion
            this.pendingTasks = this.pendingTasks.filter(t => t.id !== id);
            this.completedTasks = this.completedTasks.filter(t => t.id !== id);

            this.taskService.deleteTask(id).subscribe({
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    this.loadTasks(); // Reload on error
                }
            });
        }
    }
}
