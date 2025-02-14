export interface Task {
  id?: string | null;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt?: string; // Fecha de creación (ISO)
  initialDate?: string; // Fecha de inicio (ISO), obligatoria en "in-progress"
  updatedAt?: string; // Fecha de última actualización (ISO)
  finalDate?: string; // Fecha de finalización (ISO), obligatoria en "in-progress"
  subTasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
