"use client";
import { useState, useEffect, useRef } from "react";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";
import { useTasks } from "../contexts/TaskContext";

interface EmployeesDropdownProps {
  onSelect: (employees: string[]) => void;
  refreshTrigger: number;
}

function EmployeesDropdown({ onSelect, refreshTrigger }: EmployeesDropdownProps) {
  const { employees, loading: contextLoading, refreshEmployees } = useTasks();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const lastRefreshTrigger = useRef<number>(refreshTrigger);

  useEffect(() => {
    if (lastRefreshTrigger.current !== refreshTrigger) {
      refreshEmployees(); // Only refresh if refreshTrigger has changed
      lastRefreshTrigger.current = refreshTrigger;
    }
  }, [refreshTrigger, refreshEmployees]); // refreshEmployees is now stable

  const handleCheckboxChange = (employeeName: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeName)
        ? prev.filter((name) => name !== employeeName)
        : [...prev, employeeName]
    );
  };

  const handleSelect = () => {
    console.log("Selected employees:", selectedEmployees);
    onSelect(selectedEmployees);
  };

  return (
    <div className={styles.section}>
      <div className={styles.crop}>
        <div className={styles.content}>
          {contextLoading ? (
            <p>Loading...</p>
          ) : (
            employees.map((item, index) => (
              <CheckboxDiv
                key={index}
                img={item.avatar}
                text={`${item.name} ${item.surname}`}
                checked={selectedEmployees.includes(
                  `${item.name} ${item.surname}`
                )}
                onChange={() =>
                  handleCheckboxChange(`${item.name} ${item.surname}`)
                }
              />
            ))
          )}
        </div>
        <div className={styles.button}>
          <CustomButton
            border="rounded"
            text="არჩევა"
            background="background"
            onClick={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default EmployeesDropdown;