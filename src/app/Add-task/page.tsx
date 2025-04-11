"use client";
import DepartmentsDropdownAdd from "../components/DepartmentsDropdownAdd/DepartmentsDropdownAdd";
import EmployeesDropdownAdd from "../components/EmployeeDropdownAdd/EmployeeDropdownAdd";
import PriorityDropdown from "../components/PriorityDropdown/PriorityDropdown";
import StatusDropdownAdd from "../components/StatusDropdownAdd/StatusDropdownAdd";
import styles from "./page.module.scss";
import { useFormik } from "formik";
import Image from "next/image";
import config from "../Config/Config";

interface Priority {
  id: number;
  name: string;
  icon?: string;
}

interface Department {
  id: number;
  name: string;
}

// Removed unused Employee interface

interface FormValues {
  name: string; // Maps to "title" in the form
  description: string;
  status: string; // Will be transformed to Status object
  priority: string; // Will be transformed to Priority object
  department: string; // Will be transformed to Department object
  employee: string; // Will be transformed to Employee object
  due_date: string; // Maps to "dueDate" in the form
}

const initialValues: FormValues = {
  name: "",
  description: "",
  status: "დასაწყები",
  priority: "", // Assuming PriorityDropdown sets this
  department: "დიზაინის დეპარტამენტი",
  employee: "",
  due_date: "",
};

const validate = (values: FormValues) => {
  const errors: Partial<FormValues> = {};

  if (!values.name) {
    errors.name = "მინიმუმ 2 სიმბოლო";
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

const formatDateDisplay = (date: string): string => {
  if (!date) return "DD/MM/YYYY";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`.toUpperCase();
};

function AddTask() {
  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Transform the form data to match the API structure
        const payload = {
          name: values.name,
          description: values.description,
          due_date: values.due_date || null, // API might expect null if not provided
          status: {
            id: 1, // Replace with actual ID from StatusDropdownAdd
            name: values.status,
          },
          priority: {
            id: 1, // Replace with actual ID from PriorityDropdown
            name: values.priority || "High", // Fallback if not set
          },
          department: {
            id: 1,
            name: values.department,
          },
          employee: {
            id: 1,
            name: values.employee.split(" ")[0] || values.employee, 
            surname: values.employee.split(" ")[1] || "", 
            department_id: 1, 
          },
        };

        const response = await fetch(`${config.serverUrl}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} - ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("Task submitted successfully:", result);

        // Reset the form after successful submission
        resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(`Failed to submit the task: ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    },
    validate,
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>შექმენი ახალი დავალება</h1>
      <div className={styles.container}>
        <form onSubmit={formik.handleSubmit}>
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
                  <PriorityDropdown
                    onPriorityChange={(newPriority: string) =>
                      formik.setFieldValue("priority", newPriority)
                    }
                  />
                  {formik.errors.priority && formik.touched.priority && (
                    <div className={styles.errorMessage}>
                      {formik.errors.priority}
                    </div>
                  )}
                </div>
                <div>
                  <label>სტატუსი*</label>
                  <StatusDropdownAdd
                    initialStatus={formik.values.status}
                    onStatusChange={(newStatus: string) =>
                      formik.setFieldValue("status", newStatus)
                    }
                  />
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
                  onDepartmentChange={(newDepartment: string) =>
                    formik.setFieldValue("department", newDepartment)
                  }
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
              <div className={styles.calendar}>
                <label>დედლაინი</label>
                <div className={styles.datePickerContainer}>
                  <Image
                    src="../icons/calendar.svg"
                    width={16}
                    height={16}
                    alt="calendar icon"
                    className={styles.calendarIcon}
                  />
                  <input
                    type="date"
                    name="due_date"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.due_date}
                    className={styles.dateInput}
                  />
                  <span className={styles.dateDisplay}>
                    {formatDateDisplay(formik.values.due_date)}
                  </span>
                </div>
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

export default AddTask;
