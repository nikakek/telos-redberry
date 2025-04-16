"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DepartmentsDropdownAdd.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface DepartmentsDropdownAddProps {
  initialDepartment: string;
  onDepartmentChange: (newDepartment: string) => void;
}

function DepartmentsDropdownAdd({ initialDepartment, onDepartmentChange }: DepartmentsDropdownAddProps) {
  const { departments } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Only update if initialDepartment has changed
    if (selectedDepartment !== initialDepartment) {
      setSelectedDepartment(initialDepartment);
    }
  }, [initialDepartment, selectedDepartment]);

  const handleSelect = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    onDepartmentChange(departmentName);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        className={clsx(styles.beforeDrop, { [styles.containerActive]: isOpen })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.left}>
          <span>{selectedDepartment || "აირჩიეთ დეპარტამენტი"}</span>
        </div>
        <div className={styles.arrow}>
          <Image
            src="../icons/arrowDown.svg"
            width={14}
            height={14}
            alt="Dropdown Arrow"
            className={clsx({ [styles.arrowOpen]: isOpen })}
          />
        </div>
      </div>
      {isOpen && (
        <div className={clsx(styles.dropdownContent, { [styles.dropdownContentActive]: isOpen })}>
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={clsx(styles.dropdownItem, {
                [styles.selected]: selectedDepartment === dept.name,
              })}
              onClick={() => handleSelect(dept.name)}
            >
              <span>{dept.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DepartmentsDropdownAdd;