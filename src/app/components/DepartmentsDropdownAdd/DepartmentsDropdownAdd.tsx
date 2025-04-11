"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./DepartmentsDropdownAdd.module.scss";
import Image from "next/image";
import config from "../../Config/Config";

interface Department {
  id: number;
  name: string;
}

interface DepartmentDropdownProps {
  initialDepartment: string;
  onDepartmentChange: (newDepartment: string) => void;
}

export default function DepartmentsDropdownAdd({
  initialDepartment,
  onDepartmentChange,
}: DepartmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState(initialDepartment);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.serverUrl}/departments`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch departments: ${response.status} ${response.statusText}`
          );
        }
        const data: Department[] = await response.json();
        setDepartments(data);
        const matchedDepartment = data.find(
          (d) => d.name === initialDepartment
        );
        if (matchedDepartment) {
          setSelectedDepartment(matchedDepartment.name);
        } else {
          setSelectedDepartment(initialDepartment);
        }
      } catch (err: any) {
        console.error("Error fetching departments:", err.message);
        setError("Failed to load departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [initialDepartment]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (name: string) => {
    setSelectedDepartment(name);
    onDepartmentChange(name);
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerActive : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.beforeDrop}>
        <div className={styles.left}>
          <span>{selectedDepartment || "აირჩიე დეპარტამენტი"}</span>
        </div>
        <div className={styles.arrow} onClick={handleArrowClick}>
          <Image
            src="../icons/arrowDown.svg"
            width={14}
            height={14}
            alt="arrow down"
            className={isOpen ? styles.arrowOpen : ""}
          />
        </div>
      </div>
      {isOpen && (
        <>
          {loading ? (
            <div className={styles.dropdownItem}>Loading...</div>
          ) : error ? (
            <div className={styles.dropdownItem}>{error}</div>
          ) : (
            departments.map((department) => (
              <div
                key={department.id}
                className={styles.dropdownItem}
                onClick={() => handleOptionClick(department.name)}
              >
                <span>{department.name}</span>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
