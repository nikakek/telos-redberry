"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./EmployeeDropdownAdd.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface Employee {
  id: number;
  name: string;
  surname: string;
  avatar: string | null;
  department_id: number;
}

interface EmployeesDropdownAddProps {
  initialEmployee: string;
  selectedDepartment: string;
  onEmployeeChange: (newEmployee: string) => void;
  onAddEmployeeClick: () => void;
}

function EmployeesDropdownAdd({
  initialEmployee,
  selectedDepartment,
  onEmployeeChange,
  onAddEmployeeClick,
}: EmployeesDropdownAddProps) {
  const { employees, departments } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedEmployee !== initialEmployee) {
      setSelectedEmployee(initialEmployee);
    }
  }, [initialEmployee, selectedEmployee]);

  // Find the department ID for the selected department
  const selectedDepartmentObj = departments.find(
    (dept: any) => dept.name === selectedDepartment
  );
  const selectedDepartmentId = selectedDepartmentObj?.id;

  // Filter employees by the selected department
  const filteredEmployees = selectedDepartmentId
    ? employees.filter(
        (employee: Employee) => employee.department_id === selectedDepartmentId
      )
    : [];

  const handleSelect = (employeeName: string) => {
    setSelectedEmployee(employeeName);
    onEmployeeChange(employeeName);
    setIsOpen(false);
  };

  const selectedEmpObj = employees.find(
    (emp) => `${emp.name} ${emp.surname || ""}` === selectedEmployee
  );

  const selectedAvatar =
    selectedEmpObj?.avatar || "/icons/avatar-placeholder.svg";

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        className={clsx(styles.beforeDrop, {
          [styles.beforeDropOpen]: isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.left}>
          {selectedEmployee && (
            <Image
              src={selectedAvatar}
              width={24}
              height={24}
              alt="Employee Avatar"
              className={styles.avatar}
            />
          )}
          <span>{selectedDepartment ? (selectedEmployee || "აირჩიეთ თანამშრომელი") : ""}</span>
        </div>
        <div className={styles.arrow}>
          <Image
            src="/icons/arrowDown.svg"
            width={14}
            height={14}
            alt="Dropdown Arrow"
            className={clsx({ [styles.arrowOpen]: isOpen })}
          />
        </div>
      </div>
      {isOpen && (
        <div
          className={clsx(styles.dropdownContent, {
            [styles.dropdownContentActive]: isOpen,
          })}
        >
          <div className={styles.addEmployeeButton}>
            <button onClick={onAddEmployeeClick}> <Image src="../icons/employeesPlus.svg" width={18} height={18} alt="+"/><span>ᲓᲐᲐᲛᲐᲢᲔ ᲗᲐᲜᲐᲛᲨᲠᲝᲛᲔᲚᲘ</span></button>
          </div>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp: Employee) => {
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
                    src={emp.avatar || "/icons/avatar-placeholder.svg"}
                    width={24}
                    height={24}
                    alt={`${employeeName} Avatar`}
                    className={styles.avatar}
                  />
                  <span>{employeeName}</span>
                </div>
              );
            })
          ) : (
            <div className={styles.noEmployees}>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmployeesDropdownAdd;