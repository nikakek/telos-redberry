"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./EmployeeDropdownAdd.module.scss";
import Image from "next/image";
import config from "../../Config/Config";

interface Employee {
  id: number;
  name: string;
  surname: string;
  avatar?: string;
}

interface EmployeesDropdownAddProps {
  initialEmployee: string;
  onEmployeeChange: (newEmployee: string) => void;
}

export default function EmployeesDropdownAdd({
  initialEmployee,
  onEmployeeChange,
}: EmployeesDropdownAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(
    undefined
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.serverUrl}/employees`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch employees: ${response.status} ${response.statusText}`
          );
        }
        const data: Employee[] = await response.json();
        setEmployees(data);
        const matchedEmployee = data.find(
          (e) => `${e.name} ${e.surname}` === initialEmployee
        );
        if (matchedEmployee) {
          setSelectedEmployee(
            `${matchedEmployee.name} ${matchedEmployee.surname}`
          );
          setSelectedAvatar(matchedEmployee.avatar);
        } else {
          setSelectedEmployee(initialEmployee);
          setSelectedAvatar(undefined);
        }
      } catch (err: any) {
        console.error("Error fetching employees:", err.message);
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [initialEmployee]);

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

  const handleOptionClick = (name: string, avatar?: string) => {
    setSelectedEmployee(name);
    setSelectedAvatar(avatar);
    onEmployeeChange(name);
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerActive : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.beforeDrop}>
        <div className={styles.left}>
          {selectedAvatar && (
            <Image
              src={selectedAvatar}
              width={24}
              height={24}
              alt="employee avatar"
              className={styles.avatar}
            />
          )}
          <span>{selectedEmployee || ""}</span>
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
            employees.map((employee) => (
              <div
                key={employee.id}
                className={styles.dropdownItem}
                onClick={() =>
                  handleOptionClick(
                    `${employee.name} ${employee.surname}`,
                    employee.avatar
                  )
                }
              >
                {employee.avatar && (
                  <Image
                    src={employee.avatar}
                    width={24}
                    height={24}
                    alt={`${employee.name} ${employee.surname} avatar`}
                    className={styles.avatar}
                  />
                )}
                <span>{`${employee.name} ${employee.surname}`}</span>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
