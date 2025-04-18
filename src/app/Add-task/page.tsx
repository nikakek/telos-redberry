"use client";
import DepartmentsDropdownAdd from "../components/DepartmentsDropdownAdd/DepartmentsDropdownAdd";
import EmployeesDropdownAdd from "../components/EmployeeDropdownAdd/EmployeeDropdownAdd";
import PriorityDropdown from "../components/PriorityDropdown/PriorityDropdown";
import StatusDropdownAdd from "../components/StatusDropdownAdd/StatusDropdownAdd";
import DatePicker from "../components/Calendar/DatePicker";
import AddEmployee from "../components/AddEmployee/AddEmployee";
import styles from "./page.module.scss";
import clsx from "clsx";
import { useFormik } from "formik";
import { useTasks } from "../components/contexts/TaskContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface FormValues {
  name: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  employee: string;
  due_date: string;
}

const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
};

const defaultInitialValues: FormValues = {
  name: "",
  description: "",
  status: "დასაწყები",
  priority: "საშუალო",
  department: "",
  employee: "",
  due_date: getTomorrowDate(),
};

const validate = (values: FormValues) => {
  const errors: Partial<FormValues> = {};

  if (!values.name) {
    errors.name = "სავალდებულო";
  } else if (values.name.length < 3) {
    errors.name = "მინიმუმ 3 სიმბოლო";
  } else if (values.name.length > 255) {
    errors.name = "მაქსიმუმ 255 სიმბოლო";
  }

  if (values.description) {
    const wordCount = values.description.trim().split(/\s+/).length;
    if (wordCount < 4) {
      errors.description = "მინიმუმ 4 სიტყვა";
    } else if (values.description.length > 255) {
      errors.description = "მაქსიმუმ 255 სიმბოლო";
    }
  }

  if (!values.status) {
    errors.status = "სავალდებულო";
  }

  if (!values.priority) {
    errors.priority = "სავალდებულო";
  }

  if (!values.department) {
    errors.department = "აირჩიეთ დეპარტამენტი";
  }

  if (!values.employee) {
    errors.employee = "აირჩიეთ თანამშრომელი";
  }

  if (!values.due_date) {
    errors.due_date = "აირჩიეთ თარიღი";
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
      : (
          isWordCount
            ? value.trim().split(/\s+/).length < minLength
            : value.length < minLength
        )
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
        {isWordCount
          ? `მინიმუმ ${minLength} სიტყვა`
          : `მინიმუმ ${minLength} სიმბოლო`}
      </div>
      <div className={`${styles.validationMessage} ${maxMessageClass}`}>
        მაქსიმუმ {maxLength} სიმბოლო
      </div>
    </div>
  );
};

export default function AddTask() {
  const {
    departments,
    employees,
    priorities,
    statuses,
    addTask,
    error,
    loading,
  } = useTasks();
  const router = useRouter();
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [hasSelectedDepartment, setHasSelectedDepartment] = useState(false);
  const isMounted = useRef(false);

  const formik = useFormik<FormValues>({
    initialValues: defaultInitialValues,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (!departments || departments.length === 0) {
          throw new Error("No departments available");
        }

        const selectedStatus = statuses.find(
          (status) => status.name === values.status
        );
        if (!selectedStatus) throw new Error("Invalid status selected");

        const selectedPriority = priorities.find(
          (priority) => priority.name === values.priority
        );
        if (!selectedPriority) throw new Error("Invalid priority selected");

        const selectedDepartment = departments.find(
          (dept) => dept.name === values.department
        );
        if (!selectedDepartment) throw new Error("Invalid department selected");

        const selectedEmployee = employees.find(
          (emp) => `${emp.name} ${emp.surname}` === values.employee
        );
        if (!selectedEmployee) throw new Error("Invalid employee selected");

        const transformedDueDate = values.due_date
          ? new Date(values.due_date).toISOString()
          : null;

        const payload = {
          name: values.name,
          description: values.description || null,
          due_date: transformedDueDate,
          status_id: selectedStatus.id,
          priority_id: selectedPriority.id,
          department_id: selectedDepartment.id,
          employee_id: selectedEmployee.id,
        };

        await addTask(payload);
        localStorage.removeItem("addTaskFormState");
        resetForm();
        router.push("/");
      } catch (error: any) {
        console.error("Error submitting form:", error.message);
        formik.setFieldError(
          "name",
          `Failed to submit the task: ${error.message}`
        );
      } finally {
        setSubmitting(false);
      }
    },
    validate,
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Load saved state from localStorage on client-side mount
  useEffect(() => {
    if (isMounted.current) return; // Prevent running after initial mount
    isMounted.current = true;

    try {
      const savedState = localStorage.getItem("addTaskFormState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const { formValues, hasSelectedDepartment: savedHasSelectedDepartment } = parsedState;

        // Validate formValues against FormValues interface
        if (
          formValues &&
          typeof formValues === "object" &&
          "name" in formValues &&
          "description" in formValues &&
          "status" in formValues &&
          "priority" in formValues &&
          "department" in formValues &&
          "employee" in formValues &&
          "due_date" in formValues
        ) {
          formik.setValues(formValues as FormValues);
          setHasSelectedDepartment(!!savedHasSelectedDepartment);
        } else {
          console.warn("Invalid localStorage data, using defaults");
        }
      }
    } catch (error) {
      console.error("Error loading localStorage state:", error);
    }
  }, [formik]);

  // Save form state to localStorage
  useEffect(() => {
    try {
      const state = {
        formValues: formik.values,
        hasSelectedDepartment,
      };
      localStorage.setItem("addTaskFormState", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [formik.values, hasSelectedDepartment]);

  useEffect(() => {
    if (formik.values.due_date) {
      console.log("Calendar Date Changed in Form:", formik.values.due_date);
    }
  }, [formik.values.due_date]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={styles.formError}>Error: {error}</div>;
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>შექმენი ახალი დავალება</h1>
      <div className={styles.container}>
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          {formik.errors.name &&
            formik.touched.name &&
            typeof formik.errors.name === "string" && (
              <div className={styles.formError}>{formik.errors.name}</div>
            )}
          <div className={styles.filters}>
            <div className={styles.leftFilter}>
              <div className={styles.titleFilter}>
                <label htmlFor="name">სათაური*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                />
                <ValidationMessages
                  error={formik.errors.name}
                  value={formik.values.name}
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
              <div className={styles.dropdowns}>
                <div>
                  <label>პრიორიტეტი*</label>
                  <div className={styles.priorityDropdownDiv}>
                    <PriorityDropdown
                      onPriorityChange={(newPriority: string) =>
                        formik.setFieldValue("priority", newPriority)
                      }
                    />
                  </div>
                  {formik.errors.priority && formik.touched.priority && (
                    <div className={styles.errorMessage}>
                      {formik.errors.priority}
                    </div>
                  )}
                </div>
                <div>
                  <label>სტატუსი*</label>
                  <div className={styles.priorityDropdownDiv}>
                    <StatusDropdownAdd
                      initialStatus={formik.values.status}
                      onStatusChange={(newStatus: string) =>
                        formik.setFieldValue("status", newStatus)
                      }
                    />
                  </div>
                  {formik.errors.status && formik.touched.status && (
                    <div className={styles.errorMessage}>
                      {formik.errors.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.rightFilter}>
              <div className={styles.departmentDropdownDiv}>
                <label>დეპარტამენტი*</label>
                <DepartmentsDropdownAdd
                  initialDepartment={formik.values.department}
                  onDepartmentChange={(newDepartment: string) => {
                    formik.setFieldValue("department", newDepartment);
                    formik.setFieldValue("employee", "");
                    setHasSelectedDepartment(true);
                  }}
                />
                {formik.errors.department && formik.touched.department && (
                  <div className={styles.errorMessage}>
                    {formik.errors.department}
                  </div>
                )}
              </div>
              <div
                className={clsx(styles.employeeDropdownDiv, {
                  [styles.disabled]: !formik.values.department || !hasSelectedDepartment,
                })}
              >
                <label>თანამშრომელი*</label>
                <EmployeesDropdownAdd
                  initialEmployee={formik.values.employee}
                  selectedDepartment={formik.values.department}
                  onEmployeeChange={(newEmployee: string) =>
                    formik.setFieldValue("employee", newEmployee)
                  }
                  onAddEmployeeClick={() => setIsAddEmployeeModalOpen(true)}
                />
                {formik.errors.employee && formik.touched.employee && (
                  <div className={styles.errorMessage}>
                    {formik.errors.employee}
                  </div>
                )}
              </div>
              <div className={styles.datePickerDiv}>
                <DatePicker
                  formik={formik}
                  width={318}
                  label="დასრულების თარიღი*"
                  placeholder="აირჩიეთ თარიღი"
                  minDate={new Date()}
                  onDateChange={(date: Date | null) => {
                    formik.setFieldValue(
                      "due_date",
                      date ? date.toISOString() : ""
                    );
                  }}
                />
                {formik.errors.due_date && formik.touched.due_date && (
                  <div className={styles.errorMessage}>
                    {formik.errors.due_date}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.submitButtonContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                formik.isSubmitting || Object.keys(formik.errors).length > 0
              }
            >
              დავალების შექმნა
            </button>
          </div>
        </form>
        {isAddEmployeeModalOpen && (
          <AddEmployee onClose={() => setIsAddEmployeeModalOpen(false)} />
        )}
      </div>
    </section>
  );
}