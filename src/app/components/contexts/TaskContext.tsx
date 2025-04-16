"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  total_comments: number;
}

interface Task extends ApiTask {
  comment_count: number;
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
  updateTaskStatus: (
    taskId: number,
    newStatusId: number,
    newStatusName: string
  ) => Promise<void>;
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
  Done: "დასრულებული",
};

const statusNameToApiMap: { [key: string]: string } = {
  დასაწყები: "To Do",
  პროგრესში: "In Progress",
  "მზად ტესტირებისთვის": "Ready for Testing",
  დასრულებული: "Done",
};

const departmentNameMap: { [key: string]: string } = {
  "Design Department": "დიზაინის დეპარტამენტი",
  // Add other mappings as needed based on API response
};

const departmentNameToApiMap: { [key: string]: string } = {
  "დიზაინის დეპარტამენტი": "Design Department",
  // Add other mappings as needed based on API response
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
  const fetchingComments = useRef<Set<number>>(new Set());

  useEffect(() => {
    globalFetchState.instanceCount += 1;
    console.log(
      `TaskProvider instantiated. Total instances: ${globalFetchState.instanceCount}`
    );
    fetchStaticData();
    fetchTasks();

    return () => {
      globalFetchState.instanceCount -= 1;
      console.log(
        `TaskProvider unmounted. Total instances: ${globalFetchState.instanceCount}`
      );
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

      const [departmentsRes, employeesRes, prioritiesRes, statusesRes] =
        await Promise.all([
          fetch(`${config.serverUrl}/departments`, {
            headers: { Authorization: `Bearer ${config.token}` },
          }).then(async (res) => {
            console.log(
              "Fetching departments from:",
              `${config.serverUrl}/departments`
            );
            console.log("Departments response status:", res.status);
            const departmentsData = await res.json();
            console.log("Raw departments data:", departmentsData);
            if (!res.ok) {
              const errorData = await res.text();
              throw new Error(
                `Failed to fetch departments: ${res.status} - ${errorData}`
              );
            }
            return departmentsData;
          }),
          fetch(`${config.serverUrl}/employees`, {
            headers: { Authorization: `Bearer ${config.token}` },
          }).then(async (res) => {
            console.log(
              "Fetching employees from:",
              `${config.serverUrl}/employees`
            );
            console.log("Employees response status:", res.status);
            if (!res.ok) {
              const errorData = await res.text();
              throw new Error(
                `Failed to fetch employees: ${res.status} - ${errorData}`
              );
            }
            return res.json();
          }),
          fetch(`${config.serverUrl}/priorities`, {
            headers: { Authorization: `Bearer ${config.token}` },
          }).then(async (res) => {
            console.log(
              "Fetching priorities from:",
              `${config.serverUrl}/priorities`
            );
            console.log("Priorities response status:", res.status);
            if (!res.ok) {
              const errorData = await res.text();
              throw new Error(
                `Failed to fetch priorities: ${res.status} - ${errorData}`
              );
            }
            return res.json();
          }),
          fetch(`${config.serverUrl}/statuses`, {
            headers: { Authorization: `Bearer ${config.token}` },
          }).then(async (res) => {
            console.log(
              "Fetching statuses from:",
              `${config.serverUrl}/statuses`
            );
            console.log("Statuses response status:", res.status);
            if (!res.ok) {
              const errorData = await res.text();
              throw new Error(
                `Failed to fetch statuses: ${res.status} - ${errorData}`
              );
            }
            return res.json();
          }),
        ]);

      const mappedDepartments = departmentsRes.map((dept: Department) => ({
        ...dept,
        name: departmentNameMap[dept.name] || dept.name,
      }));

      const mappedStatuses = statusesRes.map((status: Status) => ({
        ...status,
        name: statusNameMap[status.name] || status.name,
      }));

      setDepartments(mappedDepartments);
      setEmployees(employeesRes);
      setPriorities(prioritiesRes);
      setStatuses(mappedStatuses);
      globalFetchState.hasFetchedStatic = true;
    } catch (err: any) {
      console.error("Error fetching static data:", err.message, err);
      setError(
        "Failed to load static data. Please check your network or server."
      );
      setDepartments([]);
      setEmployees([]);
      setPriorities([]);
      setStatuses([]);
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

      console.log("Fetching tasks from:", `${config.serverUrl}/tasks`);
      console.log("Tasks response status:", tasksRes.status);
      console.log(
        "Tasks response headers:",
        Object.fromEntries(tasksRes.headers.entries())
      );

      if (!tasksRes.ok) {
        let errorData;
        try {
          errorData = await tasksRes.json();
        } catch (jsonError) {
          errorData = await tasksRes.text();
        }
        throw new Error(
          `Failed to fetch tasks: ${tasksRes.status} - ${
            typeof errorData === "string"
              ? errorData
              : JSON.stringify(errorData)
          }`
        );
      }

      const tasksData = await tasksRes.json();
      console.log("Raw tasks API response:", tasksData);

      if (!Array.isArray(tasksData)) {
        console.error(
          `Expected tasksData to be an array, got: ${typeof tasksData}`,
          tasksData
        );
        setTasks([]);
        globalFetchState.hasFetchedTasks = true;
        return;
      }

      const tasksWithMappedStatus = tasksData.map((task: ApiTask) => ({
        ...task,
        status: {
          ...task.status,
          name: statusNameMap[task.status.name] || task.status.name,
        },
        comment_count: task.total_comments,
      }));

      console.log("Tasks with comment counts:", tasksWithMappedStatus);
      setTasks(tasksWithMappedStatus);
      globalFetchState.hasFetchedTasks = true;
    } catch (err: any) {
      console.error("Error fetching tasks:", err.message, err);
      setError("Failed to load tasks. Please check your network or server.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForTask = useCallback(async (taskId: number) => {
    console.log(
      `fetchCommentsForTask called for taskId: ${taskId} at ${new Date().toISOString()}`
    );

    if (fetchingComments.current.has(taskId)) {
      console.log(
        `Already fetching comments for taskId: ${taskId}, skipping...`
      );
      return;
    }

    fetchingComments.current.add(taskId);
    try {
      const commentsRes = await fetch(
        `${config.serverUrl}/tasks/${taskId}/comments`,
        {
          headers: { Authorization: `Bearer ${config.token}` },
        }
      );

      console.log(
        "Fetching comments from:",
        `${config.serverUrl}/tasks/${taskId}/comments`
      );
      console.log("Comments response status:", commentsRes.status);

      if (!commentsRes.ok) {
        const errorData = await commentsRes.text();
        console.error(
          `Failed to fetch comments for task ${taskId}: ${commentsRes.status} - ${errorData}`
        );
        return;
      }

      const commentsData = await commentsRes.json();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, commentDetails: commentsData } : task
        )
      );
    } catch (err: any) {
      console.error("Error fetching comments for task:", err.message, err);
      setError(
        "Failed to fetch comments for task. Please check your network or server."
      );
    } finally {
      fetchingComments.current.delete(taskId);
    }
  }, []);

  const addTask = async (taskData: Partial<Task>) => {
    try {
      const url = `${config.serverUrl}/tasks`;
      console.log("Adding task to URL:", url);
      console.log("Authorization token:", config.token);
      console.log("Request body:", taskData);
      console.log("Request headers:", {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify(taskData),
      });

      console.log("Add task response status:", response.status);
      console.log(
        "Add task response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = await response.text();
        }
        throw new Error(
          `Failed to add task: ${response.status} - ${
            typeof errorData === "string"
              ? errorData
              : JSON.stringify(errorData)
          }`
        );
      }

      globalFetchState.hasFetchedTasks = false;
      await fetchTasks();
    } catch (err: any) {
      console.error("Error adding task:", err.message, err);
      throw new Error(`Failed to add task: ${err.message}`);
    }
  };

  const updateTaskStatus = async (
    taskId: number,
    newStatusId: number,
    newStatusName: string
  ) => {
    try {
      const apiStatusName = statusNameToApiMap[newStatusName] || newStatusName;
      const response = await fetch(`${config.serverUrl}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({ status_id: newStatusId }),
      });

      console.log(
        `PUT /tasks/${taskId} - Status: ${response.status}, Headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
        console.error("Error updating task status:", errorData);
        throw new Error(
          `Failed to update task status on server: ${response.status} - ${
            typeof errorData === "string"
              ? errorData
              : JSON.stringify(errorData)
          }`
        );
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
          task.id === taskId
            ? {
                ...task,
                status: {
                  ...task.status,
                  id: newStatusId,
                  name: newStatusName,
                },
              }
            : task
        )
      );
    } catch (err: any) {
      console.error("Error updating task status:", err.message, err);
      throw new Error(`Failed to update task status: ${err.message}`);
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
      globalFetchState.hasFetchedTasks = false;
      fetchTasks();
    }, 300);
  };

  const refreshEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${config.serverUrl}/employees`, {
        headers: { Authorization: `Bearer ${config.token}` },
      });

      console.log("Fetching employees from:", `${config.serverUrl}/employees`);
      console.log("Refresh employees response status:", res.status);

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(
          `Failed to fetch employees: ${res.status} - ${errorData}`
        );
      }

      const employeesData = await res.json();
      setEmployees(employeesData);
    } catch (error: any) {
      console.error("Error refreshing employees:", error.message, error);
      setError(
        "Failed to refresh employees. Please check your network or server."
      );
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
