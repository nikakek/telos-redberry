"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "./DepartmentsDropdown.module.scss";

function DepartmentsDropdown({ onSelect }) {
  const [content, setContent] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  useEffect(() => {
    axios("https://momentum.redberryinternship.ge/api/departments")
      .then((result) => {
        setContent(result.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleCheckboxChange = (departmentName) => {
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
        {content.map((item, index) => (
          <CheckboxDiv
            key={index}
            text={item.name}
            checked={selectedDepartments.includes(item.name)}
            onChange={() => handleCheckboxChange(item.name)}
          />
        ))}
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
