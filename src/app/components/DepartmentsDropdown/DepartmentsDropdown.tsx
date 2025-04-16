"use client";
import { useState } from "react";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "./DepartmentsDropdown.module.scss";
import { useTasks } from "../contexts/TaskContext";

interface DepartmentsDropdownProps {
  onSelect: (departments: string[]) => void;
}

function DepartmentsDropdown({ onSelect }: DepartmentsDropdownProps) {
  const { departments, loading: contextLoading } = useTasks();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const handleCheckboxChange = (departmentName: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(departmentName)
        ? prev.filter((name) => name !== departmentName)
        : [...prev, departmentName]
    );
  };

  const handleSelect = () => {
    console.log("Selected departments:", selectedDepartments); // Debug
    onSelect(selectedDepartments);
  };

  return (
    <div className={styles.section}>
      <div className={styles.content}>
        {contextLoading ? (
          <p>Loading...</p>
        ) : (
          departments.map((item, index) => (
            <CheckboxDiv
              key={index}
              text={item.name}
              checked={selectedDepartments.includes(item.name)}
              onChange={() => handleCheckboxChange(item.name)}
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
  );
}

export default DepartmentsDropdown;