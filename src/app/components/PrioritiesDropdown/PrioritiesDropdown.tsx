"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";

function PrioritiesDropdown({ onSelect }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  useEffect(() => {
    axios
      .get("https://momentum.redberryinternship.ge/api/priorities")
      .then((result) => {
        setContent(result.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching priorities:", error);
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (priorityName) => {
    setSelectedPriorities((prev) =>
      prev.includes(priorityName)
        ? prev.filter((name) => name !== priorityName)
        : [...prev, priorityName]
    );
  };

  const handleSelect = () => {
    console.log("Selected priorities:", selectedPriorities); // Debug
    onSelect(selectedPriorities);
  };

  return (
    <div className={styles.section}>
      <div className={styles.crop}>
        <div className={styles.content}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            content.map((item, index) => (
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
