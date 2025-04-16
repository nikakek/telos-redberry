"use client";
import DepartmentsDropdownAdd from "../components/DepartmentsDropdownAdd/DepartmentsDropdownAdd";
import EmployeesDropdownAdd from "../components/EmployeeDropdownAdd/EmployeeDropdownAdd";
import PriorityDropdown from "../components/PriorityDropdown/PriorityDropdown";
import StatusDropdownAdd from "../components/StatusDropdownAdd/StatusDropdownAdd";
import DatePicker from "../components/Calendar/DatePicker";
import styles from "./page.module.scss";
import { useFormik } from "formik";
import { useTasks } from "../components/contexts/TaskContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface FormValues {
  name: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  employee: string;
  due_date: string;
}

const initialValues: FormValues = {
  name: "",
  description: "",
  status: "დასაწყები",
  priority: "",
  department: "",
  employee: "",
  due_date: "",
};

const validate = (values: FormValues) => {
  const errors: Partial<FormValues> = {};

  if (!values.name) {
    errors.name = "სავალდებულო";
  } else if (values.name.length < 2) {
    errors.name = "მინიმუმ 2 სიმბოლო";
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

  const formik = useFormik<FormValues>({
    initialValues,
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
                  minLength={2}
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
                  }}
                />
                {formik.errors.department && formik.touched.department && (
                  <div className={styles.errorMessage}>
                    {formik.errors.department}
                  </div>
                )}
              </div>
              <div className={styles.employeeDropdownDiv}>
                <label>თანამშრომელი*</label>
                <EmployeesDropdownAdd
                  initialEmployee={formik.values.employee}
                  onEmployeeChange={(newEmployee: string) =>
                    formik.setFieldValue("employee", newEmployee)
                  }
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
      </div>
    </section>
  );
}
