"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./EmployeeDropdownAdd.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface EmployeesDropdownAddProps {
  initialEmployee: string;
  onEmployeeChange: (newEmployee: string) => void;
}

function EmployeesDropdownAdd({ initialEmployee, onEmployeeChange }: EmployeesDropdownAddProps) {
  const { employees } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee);
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
    // Only update if initialEmployee has changed
    if (selectedEmployee !== initialEmployee) {
      setSelectedEmployee(initialEmployee);
    }
  }, [initialEmployee, selectedEmployee]);

  const handleSelect = (employeeName: string) => {
    setSelectedEmployee(employeeName);
    onEmployeeChange(employeeName);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        className={clsx(styles.beforeDrop, { [styles.containerActive]: isOpen })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.left}>
          {selectedEmployee && (
            <Image
              src="/icons/avatar-placeholder.svg" // Replace with emp.avatar if available
              width={24}
              height={24}
              alt="Employee Avatar"
              className={styles.avatar}
            />
          )}
          <span>{selectedEmployee || "აირჩიეთ თანამშრომელი"}</span>
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
          {employees.map((emp) => {
            const employeeName = `${emp.name} ${emp.surname || ""}`;
            return (
              <div
                key={emp.id}
                className={clsx(styles.dropdownItem, {
                  [styles.selected]: selectedEmployee === employeeName,
                })}
                onClick={() => handleSelect(employeeName)}
              >
                <Image
                  src={emp.avatar || "/icons/avatar-placeholder.svg"} // Use emp.avatar if available
                  width={24}
                  height={24}
                  alt={`${employeeName} Avatar`}
                  className={styles.avatar}
                />
                <span>{employeeName}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EmployeesDropdownAdd;