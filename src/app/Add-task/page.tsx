"use client";
import styles from "./page.module.scss";
import { useFormik } from "formik";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import config from "../Config/Config";
import { useTasks } from "../components/contexts/TaskContext";

interface Priority {
  id: number;
  name: string;
  icon: string;
}

interface Employee {
  id: number;
  name: string;
  surname: string;
  avatar: string;
}

interface Status {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const fetchPriorities = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/priorities`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch priorities: ${response.status} ${response.statusText}`);
    }
    const data: Priority[] = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching priorities:", error.message, error);
    return [];
  }
};

const fetchEmployees = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/employees`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
    }
    const data: Employee[] = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching employees:", error.message, error);
    return [];
  }
};

const fetchStatuses = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/statuses`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: ${response.status} ${response.statusText}`);
    }
    const data: Status[] = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching statuses:", error.message, error);
    return [];
  }
};

const fetchDepartments = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/departments`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
    }
    const data: Department[] = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching departments:", error.message, error);
    return [];
  }
};

const addTaskToApi = async (taskData: any) => {
  try {
    console.log("Sending task data to API:", taskData);
    const response = await fetch(`${config.serverUrl}/tasks`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      // Log response details
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      console.log("Response headers:", [...response.headers.entries()]);

      // Try to parse the response body as JSON
      let errorData;
      try {
        errorData = await response.json();
        console.error("Error response from API (JSON):", errorData);
      } catch (jsonError) {
        // If JSON parsing fails, log the raw response text
        const rawText = await response.text();
        console.error("Error response from API (raw text):", rawText);
        console.error("JSON parsing error:", jsonError);
      }
      throw new Error(`Failed to add task: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Task added successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Error adding task:", error.message, error);
    throw error;
  }
};

interface FormValues {
  title: string;
  description: string;
  department: string;
  responsibleEmployee: string;
  priority: string;
  status: string;
  dueDate: string;
}

const initialValues: FormValues = {
  title: "",
  description: "",
  department: "",
  responsibleEmployee: "",
  priority: "",
  status: "",
  dueDate: "",
};

const validate = (values: FormValues) => {
  let errors: Partial<FormValues> = {};

  // Title validation
  if (!values.title) {
    errors.title = "სავალდებულო";
  } else if (values.title.length < 3) {
    errors.title = "მინიმუმ 3 სიმბოლო";
  } else if (values.title.length > 255) {
    errors.title = "მაქსიმუმ 255 სიმბოლო";
  }

  // Description validation
  if (values.description) {
    const wordCount = values.description.trim().split(/\s+/).length;
    if (wordCount < 4) {
      errors.description = "მინიმუმ 4 სიტყვა";
    } else if (values.description.length > 255) {
      errors.description = "მაქსიმუმ 255 სიმბოლო";
    }
  }

  // Department validation
  if (!values.department) {
    errors.department = "სავალდებულო";
  }

  // Responsible Employee validation
  if (!values.responsibleEmployee) {
    errors.responsibleEmployee = "სავალდებულო";
  }

  // Priority validation
  if (!values.priority) {
    errors.priority = "სავალდებულო";
  }

  // Status validation
  if (!values.status) {
    errors.status = "სავალდებულო";
  }

  // Due Date validation
  if (!values.dueDate) {
    errors.dueDate = "სავალდებულო";
  }

  return errors;
};

const ValidationMessages = ({
  error,
  value,
  minLength,
  maxLength,
  isWordCount = false,
}: {
  error: string | undefined;
  value: string;
  minLength: number;
  maxLength: number;
  isWordCount?: boolean;
}) => {
  const minMessageClass =
    value.length === 0
      ? styles.gray
      : (isWordCount ? value.trim().split(/\s+/).length < minLength : value.length < minLength) || error === "სავალდებულო"
      ? styles.red
      : styles.green;

  const maxMessageClass =
    error === `მაქსიმუმ ${maxLength} სიმბოლო`
      ? styles.red
      : value.length > 0 && value.length <= maxLength
      ? styles.green
      : styles.gray;

  return (
    <div className={styles.validationMessages}>
      <div className={`${styles.validationMessage} ${minMessageClass}`}>
        {error === "სავალდებულო" ? "სავალდებულო" : isWordCount ? `მინიმუმ ${minLength} სიტყვა` : `მინიმუმ ${minLength} სიმბოლო`}
      </div>
      <div className={`${styles.validationMessage} ${maxMessageClass}`}>
        მაქსიმუმ {maxLength} სიმბოლო
      </div>
    </div>
  );
};

function AddTask() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingPriorities, setLoadingPriorities] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorPriorities, setErrorPriorities] = useState<string | null>(null);
  const [errorEmployees, setErrorEmployees] = useState<string | null>(null);
  const [errorStatuses, setErrorStatuses] = useState<string | null>(null);
  const [errorDepartments, setErrorDepartments] = useState<string | null>(null);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isResponsibleEmployeeDropdownOpen, setIsResponsibleEmployeeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const responsibleEmployeeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const { tasks, setTasks, refreshTasks } = useTasks();

  useEffect(() => {
    const loadData = async () => {
      // Fetch Priorities
      try {
        setLoadingPriorities(true);
        setErrorPriorities(null);
        const prioritiesData = await fetchPriorities();
        if (prioritiesData.length === 0) {
          setErrorPriorities("Failed to load priorities. Check console for details.");
        }
        console.log("Fetched priorities:", prioritiesData);
        setPriorities(prioritiesData);
      } catch (error: any) {
        setErrorPriorities("Failed to load priorities. Check console for details.");
      } finally {
        setLoadingPriorities(false);
      }

      // Fetch Employees
      try {
        setLoadingEmployees(true);
        setErrorEmployees(null);
        const employeesData = await fetchEmployees();
        if (employeesData.length === 0) {
          setErrorEmployees("Failed to load employees. Check console for details.");
        }
        console.log("Fetched employees:", employeesData);
        setEmployees(employeesData);
      } catch (error: any) {
        setErrorEmployees("Failed to load employees. Check console for details.");
      } finally {
        setLoadingEmployees(false);
      }

      // Fetch Statuses
      try {
        setLoadingStatuses(true);
        setErrorStatuses(null);
        const statusesData = await fetchStatuses();
        if (statusesData.length === 0) {
          setErrorStatuses("Failed to load statuses. Check console for details.");
        }
        console.log("Fetched statuses:", statusesData);
        setStatuses(statusesData);
      } catch (error: any) {
        setErrorStatuses("Failed to load statuses. Check console for details.");
      } finally {
        setLoadingStatuses(false);
      }

      // Fetch Departments
      try {
        setLoadingDepartments(true);
        setErrorDepartments(null);
        const departmentsData = await fetchDepartments();
        if (departmentsData.length === 0) {
          setErrorDepartments("Failed to load departments. Check console for details.");
        }
        console.log("Fetched departments:", departmentsData);
        setDepartments(departmentsData);
      } catch (error: any) {
        setErrorDepartments("Failed to load departments. Check console for details.");
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadData();
  }, []);

  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        setSubmitting(false);
        setSubmissionError("გთხოვთ შეავსოთ ყველა საჭირო ველი სწორად");
        return;
      }

      try {
        setSubmissionError(null);
        const taskData = {
          title: values.title,
          description: values.description || null,
          department_id: parseInt(values.department),
          responsible_employee_id: parseInt(values.responsibleEmployee),
          assignee_id: parseInt(values.responsibleEmployee), // In case API requires it
          priority_id: parseInt(values.priority),
          status_id: parseInt(values.status),
          due_date: values.dueDate,
        };

        console.log("Submitting task data:", taskData);

        const newTask = await addTaskToApi(taskData);

        // Add the new task to the TaskContext
        setTasks((prev) => [
          ...prev,
          {
            id: newTask.id,
            name: newTask.title,
            description: newTask.description,
            due_date: newTask.due_date,
            department: departments.find((dept) => dept.id.toString() === values.department) || {
              id: 0,
              name: "Unknown",
            },
            employee: employees.find((emp) => emp.id.toString() === values.responsibleEmployee) || {
              id: 0,
              name: "Unknown",
              surname: "",
              avatar: "",
            },
            status: statuses.find((status) => status.id.toString() === values.status) || {
              id: 0,
              name: "Unknown",
            },
            priority: priorities.find((prio) => prio.id.toString() === values.priority) || {
              id: 0,
              name: "Unknown",
              icon: "",
            },
            comments: 0,
          },
        ]);

        resetForm();
        refreshTasks();
      } catch (error) {
        setSubmissionError("დავალების დამატება ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.");
      } finally {
        setSubmitting(false);
      }
    },
    validate,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handlePrioritySelect = (priorityId: string) => {
    formik.setFieldValue("priority", priorityId);
    setIsPriorityDropdownOpen(false);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    formik.setFieldValue("department", departmentId);
    setIsDepartmentDropdownOpen(false);
  };

  const handleResponsibleEmployeeSelect = (employeeId: string) => {
    formik.setFieldValue("responsibleEmployee", employeeId);
    setIsResponsibleEmployeeDropdownOpen(false);
  };

  const handleStatusSelect = (statusId: string) => {
    formik.setFieldValue("status", statusId);
    setIsStatusDropdownOpen(false);
  };

  const hasFetchErrors = errorPriorities || errorEmployees || errorStatuses || errorDepartments;

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>შექმენი ახალი დავალება</h1>
      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.leftFilter}>
            <form onSubmit={formik.handleSubmit}>
              <div className={styles.titleFilter}>
                <label htmlFor="title">დავალების სათაური*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                />
                <ValidationMessages
                  error={formik.errors.title}
                  value={formik.values.title}
                  minLength={3}
                  maxLength={255}
                />
              </div>
              <div className={styles.aboutFilter}>
                <label htmlFor="description">დავალების აღწერა</label>
                <textarea
                  id="description"
                  name="description"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                />
                {formik.values.description && (
                  <ValidationMessages
                    error={formik.errors.description}
                    value={formik.values.description}
                    minLength={4}
                    maxLength={255}
                    isWordCount={true}
                  />
                )}
              </div>
              <div className={styles.priorityStatus}>
                <label htmlFor="department">დეპარტამენტი*</label>
                {loadingDepartments ? (
                  <div>Loading departments...</div>
                ) : errorDepartments ? (
                  <div className={styles.errorMessage}>{errorDepartments}</div>
                ) : (
                  <div className={styles.customDropdownWrapper} ref={departmentDropdownRef}>
                    <div
                      className={`${styles.customDropdown} ${isDepartmentDropdownOpen ? styles.active : ""}`}
                      onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                    >
                      <span>
                        {formik.values.department
                          ? departments.find((dept) => dept.id.toString() === formik.values.department)?.name || "აირჩიე დეპარტამენტი"
                          : "აირჩიე დეპარტამენტი"}
                      </span>
                      <Image
                        src="../icons/dropdown-arrow.svg"
                        width={16}
                        height={16}
                        alt="Dropdown Arrow"
                        className={isDepartmentDropdownOpen ? styles.arrowOpen : ""}
                      />
                    </div>
                    {isDepartmentDropdownOpen && (
                      <div className={styles.dropdownContent}>
                        {departments.map((dept) => (
                          <div
                            key={dept.id}
                            className={`${styles.dropdownItem} ${
                              formik.values.department === dept.id.toString() ? styles.selected : ""
                            }`}
                            onClick={() => handleDepartmentSelect(dept.id.toString())}
                          >
                            {dept.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.priorityStatus}>
                <label htmlFor="responsibleEmployee">პასუხისმგებელი თანამშრომელი*</label>
                {loadingEmployees ? (
                  <div>Loading employees...</div>
                ) : errorEmployees ? (
                  <div className={styles.errorMessage}>{errorEmployees}</div>
                ) : (
                  <div className={styles.customDropdownWrapper} ref={responsibleEmployeeDropdownRef}>
                    <div
                      className={`${styles.customDropdown} ${isResponsibleEmployeeDropdownOpen ? styles.active : ""}`}
                      onClick={() => setIsResponsibleEmployeeDropdownOpen(!isResponsibleEmployeeDropdownOpen)}
                    >
                      <span>
                        {formik.values.responsibleEmployee
                          ? employees.find((emp) => emp.id.toString() === formik.values.responsibleEmployee)?.name || "აირჩიე თანამშრომელი"
                          : "აირჩიე თანამშრომელი"}
                      </span>
                      <Image
                        src="../icons/dropdown-arrow.svg"
                        width={16}
                        height={16}
                        alt="Dropdown Arrow"
                        className={isResponsibleEmployeeDropdownOpen ? styles.arrowOpen : ""}
                      />
                    </div>
                    {isResponsibleEmployeeDropdownOpen && (
                      <div className={styles.dropdownContent}>
                        {employees.map((emp) => (
                          <div
                            key={emp.id}
                            className={`${styles.dropdownItem} ${
                              formik.values.responsibleEmployee === emp.id.toString() ? styles.selected : ""
                            }`}
                            onClick={() => handleResponsibleEmployeeSelect(emp.id.toString())}
                          >
                            {emp.name} {emp.surname}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.priorityStatus}>
                <label htmlFor="priority">პრიორიტეტი*</label>
                {loadingPriorities ? (
                  <div>Loading priorities...</div>
                ) : errorPriorities ? (
                  <div className={styles.errorMessage}>{errorPriorities}</div>
                ) : (
                  <div className={styles.customDropdownWrapper} ref={priorityDropdownRef}>
                    <div
                      className={`${styles.customDropdown} ${isPriorityDropdownOpen ? styles.active : ""}`}
                      onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                    >
                      <span>
                        {formik.values.priority
                          ? priorities.find((prio) => prio.id.toString() === formik.values.priority)?.name || "აირჩიე პრიორიტეტი"
                          : "აირჩიე პრიორიტეტი"}
                      </span>
                      <Image
                        src="../icons/dropdown-arrow.svg"
                        width={16}
                        height={16}
                        alt="Dropdown Arrow"
                        className={isPriorityDropdownOpen ? styles.arrowOpen : ""}
                      />
                    </div>
                    {isPriorityDropdownOpen && (
                      <div className={styles.dropdownContent}>
                        {priorities.map((prio) => (
                          <div
                            key={prio.id}
                            className={`${styles.dropdownItem} ${
                              formik.values.priority === prio.id.toString() ? styles.selected : ""
                            }`}
                            onClick={() => handlePrioritySelect(prio.id.toString())}
                          >
                            {prio.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.priorityStatus}>
                <label htmlFor="status">სტატუსი*</label>
                {loadingStatuses ? (
                  <div>Loading statuses...</div>
                ) : errorStatuses ? (
                  <div className={styles.errorMessage}>{errorStatuses}</div>
                ) : (
                  <div className={styles.customDropdownWrapper} ref={statusDropdownRef}>
                    <div
                      className={`${styles.customDropdown} ${isStatusDropdownOpen ? styles.active : ""}`}
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    >
                      <span>
                        {formik.values.status
                          ? statuses.find((status) => status.id.toString() === formik.values.status)?.name || "აირჩიე სტატუსი"
                          : "აირჩიე სტატუსი"}
                      </span>
                      <Image
                        src="../icons/dropdown-arrow.svg"
                        width={16}
                        height={16}
                        alt="Dropdown Arrow"
                        className={isStatusDropdownOpen ? styles.arrowOpen : ""}
                      />
                    </div>
                    {isStatusDropdownOpen && (
                      <div className={styles.dropdownContent}>
                        {statuses.map((status) => (
                          <div
                            key={status.id}
                            className={`${styles.dropdownItem} ${
                              formik.values.status === status.id.toString() ? styles.selected : ""
                            }`}
                            onClick={() => handleStatusSelect(status.id.toString())}
                          >
                            {status.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.priorityStatus}>
                <label htmlFor="dueDate">დავალების ვადა*</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.dueDate}
                />
                {formik.errors.dueDate && formik.touched.dueDate && (
                  <div className={styles.errorMessage}>{formik.errors.dueDate}</div>
                )}
              </div>
              {submissionError && (
                <div className={styles.errorMessage}>{submissionError}</div>
              )}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={formik.isSubmitting || Object.keys(formik.errors).length > 0 || hasFetchErrors}
              >
                დავალების შექმნა
              </button>
            </form>
          </div>
          <div className={styles.rightFilter}></div>
        </div>
      </div>
    </section>
  );
}

export default AddTask;