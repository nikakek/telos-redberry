"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import config from "../../Config/Config";

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  surname: string;
  avatar: string;
}

interface Priority {
  id: number;
  name: string;
  icon: string;
}

interface Status {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  author_nickname: string;
  text: string;
  author_avatar: string | null;
  parent_id: number | null;
  sub_comments?: Comment[];
}

interface ApiTask {
  id: number;
  name: string;
  description: string | null;
  due_date: string;
  department: Department;
  employee: Employee;
  status: Status;
  priority: Priority;
}

interface Task extends ApiTask {
  comment_count: number; // Added for client-side state
  commentDetails?: Comment[];
}

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  departments: Department[];
  employees: Employee[];
  priorities: Priority[];
  statuses: Status[];
  addTask: (taskData: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: number, newStatusId: number, newStatusName: string) => Promise<void>;
  updateTaskComments: (taskId: number, newCommentCount: number) => void;
  refreshTasks: () => void;
  refreshEmployees: () => Promise<void>;
  fetchCommentsForTask: (taskId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const globalFetchState = {
  hasFetchedStatic: false,
  hasFetchedTasks: false,
  instanceCount: 0,
};

const statusNameMap: { [key: string]: string } = {
  "To Do": "დასაწყები",
  "In Progress": "პროგრესში",
  "Ready for Testing": "მზად ტესტირებისთვის",
  "Done": "დასრულებული",
};

const statusNameToApiMap: { [key: string]: string } = {
  "დასაწყები": "To Do",
  "პროგრესში": "In Progress",
  "მზად ტესტირებისთვის": "Ready for Testing",
  "დასრულებული": "Done",
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    globalFetchState.instanceCount += 1;
    console.log(`TaskProvider instantiated. Total instances: ${globalFetchState.instanceCount}`);
    fetchStaticData();
    fetchTasks();

    return () => {
      globalFetchState.instanceCount -= 1;
      console.log(`TaskProvider unmounted. Total instances: ${globalFetchState.instanceCount}`);
    };
  }, []);

  const fetchStaticData = async () => {
    if (globalFetchState.hasFetchedStatic) {
      console.log("Static data already fetched globally, skipping...");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [departmentsRes, employeesRes, prioritiesRes, statusesRes] = await Promise.all([
        fetch(`${config.serverUrl}/departments`, {
          headers: { Authorization: `Bearer ${config.token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch departments: ${res.status}`);
          return res.json();
        }),
        fetch(`${config.serverUrl}/employees`, {
          headers: { Authorization: `Bearer ${config.token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch employees: ${res.status}`);
          return res.json();
        }),
        fetch(`${config.serverUrl}/priorities`, {
          headers: { Authorization: `Bearer ${config.token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch priorities: ${res.status}`);
          return res.json();
        }),
        fetch(`${config.serverUrl}/statuses`, {
          headers: { Authorization: `Bearer ${config.token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch statuses: ${res.status}`);
          return res.json();
        }),
      ]);

      // Map status names to Georgian
      const mappedStatuses = statusesRes.map((status: Status) => ({
        ...status,
        name: statusNameMap[status.name] || status.name,
      }));

      setDepartments(departmentsRes);
      setEmployees(employeesRes);
      setPriorities(prioritiesRes);
      setStatuses(mappedStatuses);
      globalFetchState.hasFetchedStatic = true;
    } catch (err: any) {
      console.error("Error fetching static data:", err.message, err);
      setError("Failed to load static data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    console.log("fetchTasks called at:", new Date().toISOString());

    if (globalFetchState.hasFetchedTasks) {
      console.log("Tasks already fetched globally, skipping...");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tasksRes = await fetch(`${config.serverUrl}/tasks`, {
        headers: { Authorization: `Bearer ${config.token}` },
      });
      if (!tasksRes.ok) throw new Error(`Failed to fetch tasks: ${tasksRes.status}`);
      const tasksData = await tasksRes.json();
      console.log("Raw tasks API response:", tasksData);

      // Map status names to Georgian
      const tasksWithMappedStatus = tasksData.map((task: ApiTask) => ({
        ...task,
        status: {
          ...task.status,
          name: statusNameMap[task.status.name] || task.status.name,
        },
        comment_count: 0, // Initialize with 0, will be updated
      }));

      // Fetch comments for all tasks
      const tasksWithComments = await Promise.all(
        tasksWithMappedStatus.map(async (task: Task) => {
          try {
            const commentsRes = await fetch(`${config.serverUrl}/tasks/${task.id}/comments`, {
              headers: { Authorization: `Bearer ${config.token}` },
            });
            if (!commentsRes.ok) {
              console.warn(`Failed to fetch comments for task ${task.id}: ${commentsRes.status}`);
              return { ...task, comment_count: 0 };
            }
            const commentsData = await commentsRes.json();

            // Calculate total comment count including subcomments
            const totalComments = commentsData.reduce((count: number, comment: Comment) => {
              const subCommentCount = comment.sub_comments ? comment.sub_comments.length : 0;
              return count + 1 + subCommentCount;
            }, 0);

            return { ...task, comment_count: totalComments };
          } catch (error) {
            console.error(`Error fetching comments for task ${task.id}:`, error);
            return { ...task, comment_count: 0 };
          }
        })
      );

      console.log("Tasks with comment counts:", tasksWithComments);
      setTasks(tasksWithComments);
      globalFetchState.hasFetchedTasks = true;
    } catch (err: any) {
      console.error("Error fetching tasks:", err.message, err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForTask = useCallback(async (taskId: number) => {
    try {
      const commentsRes = await fetch(`${config.serverUrl}/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${config.token}` },
      });
      if (!commentsRes.ok) {
        console.error(`Failed to fetch comments for task ${taskId}: ${commentsRes.status}`);
        return;
      }
      const commentsData = await commentsRes.json();

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, commentDetails: commentsData }
            : task
        )
      );
    } catch (err: any) {
      console.error("Error fetching comments for task:", err.message, err);
      setError("Failed to fetch comments for task.");
    }
  }, []);

  const addTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch(`${config.serverUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}` },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add task: ${response.status} - ${errorData.message || response.statusText}`);
      }

      globalFetchState.hasFetchedTasks = false; // Reset tasks cache on new task
      await fetchTasks();
    } catch (err: any) {
      console.error("Error adding task:", err.message, err);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: number, newStatusId: number, newStatusName: string) => {
    try {
      const apiStatusName = statusNameToApiMap[newStatusName] || newStatusName;
      const response = await fetch(`${config.serverUrl}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}` },
        body: JSON.stringify({ status_id: newStatusId }),
      });

      console.log(`PUT /tasks/${taskId} - Status: ${response.status}, Headers:`, response.headers.get("Content-Type"));

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
        console.error("Error updating task status:", errorData);
        throw new Error(`Failed to update task status on server: ${response.status} - ${typeof errorData === "string" ? errorData : JSON.stringify(errorData)}`);
      }

      const contentType = response.headers.get("Content-Type");
      let responseData;
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        throw new Error("Server did not return JSON response");
      }

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
        task.id === taskId ? { ...task, comment_count: newCommentCount } : task
      )
    );
  };

  const refreshTasks = () => {
    console.log("refreshTasks called at:", new Date().toISOString());
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      globalFetchState.hasFetchedTasks = false; // Reset tasks cache
      fetchTasks();
    }, 300);
  };

  const refreshEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${config.serverUrl}/employees`, {
        headers: { Authorization: `Bearer ${config.token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch employees: ${res.status}`);
      const employeesData = await res.json();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error refreshing employees:", error);
      setError("Failed to refresh employees.");
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        departments,
        employees,
        priorities,
        statuses,
        addTask,
        updateTaskStatus,
        updateTaskComments,
        refreshTasks,
        refreshEmployees,
        fetchCommentsForTask,
        loading,
        error,
      }}
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