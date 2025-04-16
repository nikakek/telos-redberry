"use client";
import styles from "./AddEmployee.module.scss";
import Image from "next/image";
import { useFormik } from "formik";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import config from "../../Config/Config";
import { useTasks } from "../../components/contexts/TaskContext";

const fetchDepartments = async () => {
  const response = await fetch(`${config.serverUrl}/departments`, {
    headers: { Authorization: `Bearer ${config.token}` },
  });
  return response.ok ? await response.json() : [];
};

const addEmployeeToApi = async (employeeData: FormData) => {
  const response = await fetch(`${config.serverUrl}/employees`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
    },
    body: employeeData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to add employee: ${response.status} - ${errorData.message || response.statusText}`);
  }
  return response.json();
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
  const errors: Partial<FormValues> = {};

  if (values.name.length < 2) errors.name = "მინიმუმ 2 სიმბოლო";
  else if (values.name.length > 255) errors.name = "მაქსიმუმ 255 სიმბოლო";
  else if (!/^[a-zA-Zა-ჰ]+$/.test(values.name) && values.name.length > 0)
    errors.name = "მარტო ლათინური ან ქართული სიმბოლოები";

  if (values.surname.length < 2) errors.surname = "მინიმუმ 2 სიმბოლო";
  else if (values.surname.length > 255) errors.surname = "მაქსიმუმ 255 სიმბოლო";
  else if (!/^[a-zA-Zა-ჰ]+$/.test(values.surname) && values.surname.length > 0)
    errors.surname = "მარტო ლათინური ან ქართული სიმბოლოები";

  if (values.avatar) {
    if (!values.avatar.type.startsWith("image/")) errors.avatar = "უნდა იყოს სურათის ტიპის" as any;
    else if (values.avatar.size > 600 * 1024) errors.avatar = "მაქსიმუმ 600kb ზომაში" as any;
  }

  if (!values.department) errors.department = "required";

  return errors;
};

interface AddEmployeeProps {
  onClose: () => void;
}

const ValidationMessages = ({ error, value }: { error: string | undefined; value: string }) => {
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
        {error === "მარტო ლათინური ან ქართული სიმბოლოები" ? "მარტო ლათინური ან ქართული სიმბოლოები" : "მინიმუმ 2 სიმბოლო"}
      </div>
      <div className={`${styles.validationMessage} ${maxMessageClass}`}>მაქსიმუმ 255 სიმბოლო</div>
    </div>
  );
};

export default function AddEmployee({ onClose }: AddEmployeeProps) {
  const { refreshEmployees } = useTasks(); // Access refreshEmployees from TaskContext
  const [departments, setDepartments] = useState<any[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDepartments().then(setDepartments);
  }, []);

  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("surname", values.surname);
      formData.append("department_id", values.department);
      if (values.avatar) {
        formData.append("avatar", values.avatar);
      }

      try {
        await addEmployeeToApi(formData);
        await refreshEmployees(); // Refresh the employees list after adding
        onClose();
      } catch (err: any) {
        console.error("Error adding employee:", err.message);
        formik.setFieldError("avatar", "Failed to add employee. Please try again.");
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
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    formik.setFieldValue("avatar", null);
    setAvatarPreview(null);
  };

  const handleClose = () => {
    formik.resetForm();
    setAvatarPreview(null);
    setIsDropdownOpen(false);
    onClose();
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDepartmentSelect = (departmentId: string) => {
    formik.setFieldValue("department", departmentId);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container} ref={formRef}>
        <div className={styles.exitButton} onClick={handleClose}>
          <Image src="../icons/exitButton.svg" width={40} height={40} alt="X" />
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
                <ValidationMessages error={formik.errors.name} value={formik.values.name} />
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
                <ValidationMessages error={formik.errors.surname} value={formik.values.surname} />
              </div>
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="avatar">ავატარი</label>
              <div className={styles.avatarUploadWrapper}>
                {!avatarPreview ? (
                  <div className={styles.avatarPlaceholder}>
                    <Image src="../icons/uploadPhoto.svg" width={24} height={24} alt="Upload Icon" />
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
                    <Image src={avatarPreview} alt="Avatar Preview" width={100} height={100} className={styles.avatarImage} />
                    <button type="button" onClick={removeAvatar} className={styles.removeAvatarButton}>
                      <Image src="../icons/bin.svg" width={24} height={24} alt="Remove" />
                    </button>
                  </div>
                )}
              </div>
              {formik.touched.avatar && formik.errors.avatar && (
                <div className={styles.validationMessage}>{formik.errors.avatar}</div>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="department">დეპარტმენტი*</label>
              <div className={clsx(styles.customDropdownWrapper, styles.dropdownDiv)} ref={dropdownRef}>
                <div
                  className={`${styles.customDropdown} ${isDropdownOpen ? styles.active : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>
                    {formik.values.department
                      ? departments.find((dept) => dept.id.toString() === formik.values.department)?.name || ""
                      : ""}
                  </span>
                  <Image
                    src="../icons/arrowDown.svg"
                    width={16}
                    height={16}
                    alt="Dropdown Arrow"
                    className={isDropdownOpen ? styles.arrowOpen : styles.arrowLocked}
                  />
                </div>
                {isDropdownOpen && (
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
            </div>
            <div className={styles.buttons}>
              <button type="button" className={styles.cancelButton} onClick={handleClose}>
                გაუქმება
              </button>
              <button type="submit" className={styles.submitButton} disabled={formik.isSubmitting}>
                დაამატე თანამშრომელი
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}