"use client";
import { useState } from "react";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";
import { useTasks } from "../contexts/TaskContext";

interface PrioritiesDropdownProps {
  onSelect: (priorities: string[]) => void;
}

function PrioritiesDropdown({ onSelect }: PrioritiesDropdownProps) {
  const { priorities, loading: contextLoading } = useTasks();
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const handleCheckboxChange = (priorityName: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priorityName)
        ? prev.filter((name) => name !== priorityName)
        : [...prev, priorityName]
    );
  };

  const handleSelect = () => {
    console.log("Selected priorities:", selectedPriorities);
    onSelect(selectedPriorities);
  };

  return (
    <div className={styles.section}>
      <div className={styles.crop}>
        <div className={styles.content}>
          {contextLoading ? (
            <p>Loading...</p>
          ) : (
            priorities.map((item, index) => (
              <CheckboxDiv
                key={index}
                text={item.name}
                checked={selectedPriorities.includes(item.name)}
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
    </div>
  );
}

export default PrioritiesDropdown;