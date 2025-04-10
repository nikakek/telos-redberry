"use client";
import { createContext, useContext, useState, useEffect } from "react";
import config from "../../Config/Config";

interface ApiTask {
  id: number;
  name: string;
  description: string | null;
  due_date: string;
  department: { id: number; name: string };
  employee: { id: number; name: string; surname: string; avatar: string };
  status: { id: number; name: string };
  priority: { id: number; name: string; icon: string };
}

interface Task extends ApiTask {
  comments: number;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: number, newStatusId: number, newStatusName: string) => Promise<void>;
  updateTaskComments: (taskId: number, newCommentCount: number) => void;
  refreshTasks: () => void;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.serverUrl}/tasks`, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching tasks:", errorData);
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
      }
      const tasksData: ApiTask[] = await response.json();
      console.log("Fetched tasks in TaskProvider:", tasksData);
      const tasksWithComments = await Promise.all(
        tasksData.map(async (task: ApiTask) => {
          const commentsResponse = await fetch(`${config.serverUrl}/tasks/${task.id}/comments`, {
            headers: { Authorization: `Bearer ${config.token}` },
          });
          if (!commentsResponse.ok) {
            const errorData = await commentsResponse.json();
            console.error(`Error fetching comments for task ${task.id}:`, errorData);
            throw new Error(`Failed to fetch comments for task ${task.id}: ${commentsResponse.status} ${commentsResponse.statusText}`);
          }
          const comments = await commentsResponse.json();
          return { ...task, comments: comments.length };
        })
      );
      setTasks(tasksWithComments);
    } catch (err: any) {
      console.error("Error fetching tasks:", err.message, err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const updateTaskStatus = async (taskId: number, newStatusId: number, newStatusName: string) => {
    try {
      // Update the server
      const response = await fetch(`${config.serverUrl}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({ status_id: newStatusId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating task status:", errorData);
        throw new Error(`Failed to update task status on server: ${response.status} ${response.statusText}`);
      }

      // Update the context
      console.log(`Updating task ${taskId} to status: ${newStatusName}`);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: { ...task.status, id: newStatusId, name: newStatusName } } : task
        )
      );
    } catch (err: any) {
      console.error("Error updating task status:", err.message, err);
      throw err;
    }
  };

  const updateTaskComments = (taskId: number, newCommentCount: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, comments: newCommentCount } : task
      )
    );
  };

  const refreshTasks = () => {
    fetchTasksData();
  };

  return (
    <TaskContext.Provider
      value={{ tasks, setTasks, updateTaskStatus, updateTaskComments, refreshTasks, loading, error }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}