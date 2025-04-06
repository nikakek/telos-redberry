"use client";
import styles from "./AddEmployee.module.scss";
import Image from "next/image";
import { useFormik } from "formik";
import { useState, useEffect, useRef } from "react";
import config from "../../Config/Config"; // Adjust the import path as needed

// Fetch departments from the API
const fetchDepartments = async () => {
  try {
    const response = await fetch("https://momentum.redberryinternship.ge/api/departments", {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// Submit employee data to the API
const addEmployeeToApi = async (employeeData: FormData) => {
  try {
    const response = await fetch("https://momentum.redberryinternship.ge/api/employees", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: employeeData,
    });

    if (!response.ok) {
      throw new Error("Failed to add employee");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

interface FormValues {
  name: string;
  surname: string;
  avatar: File | null;
  department: string;
}

const initialValues: FormValues = {
  name: "",
  surname: "",
  avatar: null,
  department: "",
};

const validate = (values: FormValues) => {
  let errors: Partial<FormValues> = {};

  if (values.name.length < 2) {
    errors.name = "მინიმუმ 2 სიმბოლო";
  } else if (values.name.length > 255) {
    errors.name = "მაქსიმუმ 255 სიმბოლო";
  } else if (!/^[a-zA-Zა-ჰ]+$/.test(values.name) && values.name.length > 0) {
    errors.name = "მარტო ლათინური ან ქართული სიმბოლოები";
  }

  if (values.surname.length < 2) {
    errors.surname = "მინიმუმ 2 სიმბოლო";
  } else if (values.surname.length > 255) {
    errors.surname = "მაქსიმუმ 255 სიმბოლო";
  } else if (
    !/^[a-zA-Zა-ჰ]+$/.test(values.surname) &&
    values.surname.length > 0
  ) {
    errors.surname = "მარტო ლათინური ან ქართული სიმბოლოები";
  }

  if (values.avatar) {
    if (!values.avatar.type.startsWith("image/")) {
      errors.avatar = "უნდა იყოს სურათის ტიპის" as any;
    } else if (values.avatar.size > 600 * 1024) {
      errors.avatar = "მაქსიმუმ 600kb ზომაში" as any;
    }
  }

  if (!values.department) {
    errors.department = "required";
  }

  return errors;
};

interface AddEmployeeProps {
  onClose: () => void;
  onEmployeeAdded: () => void;
}

const ValidationMessages = ({
  error,
  value,
}: {
  error: string | undefined;
  value: string;
}) => {
  const minMessageClass =
    value.length === 0
      ? styles.gray
      : value.length < 2 || error === "მარტო ლათინური ან ქართული სიმბოლოები"
      ? styles.red
      : styles.green;

  const maxMessageClass =
    error === "მაქსიმუმ 255 სიმბოლო"
      ? styles.red
      : value.length > 0 && value.length <= 255
      ? styles.green
      : styles.gray;

  return (
    <div className={styles.validationMessages}>
      <div className={`${styles.validationMessage} ${minMessageClass}`}>
        {error === "მარტო ლათინური ან ქართული სიმბოლოები"
          ? "მარტო ლათინური ან ქართული სიმბოლოები"
          : "მინიმუმ 2 სიმბოლო"}
      </div>
      <div className={`${styles.validationMessage} ${maxMessageClass}`}>
        მაქსიმუმ 255 სიმბოლო
      </div>
    </div>
  );
};

export default function AddEmployee({ onClose, onEmployeeAdded }: AddEmployeeProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDepartments().then((data) => setDepartments(data));
  }, []);

  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        setSubmitting(false);
        setSubmissionError("გთხოვთ შეავსოთ ყველა საჭირო ველი სწორად");
        return;
      }

      try {
        setSubmissionError(null);
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("surname", values.surname);
        formData.append("department_id", values.department);
        if (values.avatar) {
          formData.append("avatar", values.avatar);
        } else {
          formData.append("avatar", "");
        }

        await addEmployeeToApi(formData);
        onEmployeeAdded();
        onClose();
      } catch (error) {
        setSubmissionError("თანამშრომლის დამატება ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.");
      } finally {
        setSubmitting(false);
      }
    },
    validate,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        formik.setFieldError("avatar", "უნდა იყოს სურათის ტიპის");
        return;
      }
      if (file.size > 600 * 1024) {
        formik.setFieldError("avatar", "მაქსიმუმ 600kb ზომაში");
        return;
      }
      formik.setFieldValue("avatar", file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const removeAvatar = () => {
    formik.setFieldValue("avatar", null);
    setAvatarPreview(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    formik.resetForm();
    setAvatarPreview(null);
    setIsDropdownOpen(false);
    setSubmissionError(null);
    onClose();
  };

  const handleDepartmentSelect = (departmentId: string) => {
    formik.setFieldValue("department", departmentId);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container} ref={formRef}>
        <div className={styles.exitButton} onClick={handleClose}>
          <Image src={"../icons/exitButton.svg"} width={40} height={40} alt="X" />
        </div>
        <h1 className={styles.title}>თანამშრომლის დამატება</h1>
        <div className={styles.infoDiv}>
          <form className={styles.form} onSubmit={formik.handleSubmit}>
            <div className={styles.nameSurname}>
              <div className={styles.inputGroup}>
                <label htmlFor="name">სახელი*</label>
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
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="surname">გვარი*</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.surname}
                />
                <ValidationMessages
                  error={formik.errors.surname}
                  value={formik.values.surname}
                />
              </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="avatar">ავატარი</label>
              <div className={styles.avatarUploadWrapper}>
                {!avatarPreview ? (
                  <div className={styles.avatarPlaceholder}>
                    <Image
                      src="../icons/uploadPhoto.svg"
                      width={24}
                      height={24}
                      alt="Upload Icon"
                    />
                    <span>ატვირთე ფოტო</span>
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.avatarInput}
                    />
                  </div>
                ) : (
                  <div className={styles.avatarPreview}>
                    <Image
                      src={avatarPreview}
                      alt="Avatar Preview"
                      width={100}
                      height={100}
                      className={styles.avatarImage}
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className={styles.removeAvatarButton}
                    >
                      <Image
                        src="../icons/bin.svg"
                        width={24}
                        height={24}
                        alt="Remove"
                      />
                    </button>
                  </div>
                )}
              </div>
              {formik.touched.avatar && formik.errors.avatar && (
                <div className={styles.validationMessage}>
                  {formik.errors.avatar}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="department">დეპარტმენტი*</label>
              <div className={styles.customDropdownWrapper} ref={dropdownRef}>
                <div
                  className={`${styles.customDropdown} ${
                    isDropdownOpen ? styles.active : ""
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>
                    {formik.values.department
                      ? departments.find(
                          (dept) => dept.id.toString() === formik.values.department
                        )?.name || "აირჩიე დეპარტამენტი"
                      : "აირჩიე დეპარტამენტი"}
                  </span>
                  <Image
                    src="../icons/dropdown-arrow.svg"
                    width={16}
                    height={16}
                    alt="Dropdown Arrow"
                    className={isDropdownOpen ? styles.arrowOpen : ""}
                  />
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownContent}>
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className={`${styles.dropdownItem} ${
                          formik.values.department === dept.id.toString()
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() => handleDepartmentSelect(dept.id.toString())}
                      >
                        {dept.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {submissionError && (
              <div className={styles.errorMessage}>{submissionError}</div>
            )}

            <div className={styles.buttons}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
              >
                გაუქმება
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={formik.isSubmitting}
              >
                თანამშრომლის დამატება
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}