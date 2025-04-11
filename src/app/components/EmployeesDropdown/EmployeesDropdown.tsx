"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import config from "../../Config/Config";

function EmployeesDropdown({ onSelect }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get(`${config.serverUrl}/employees`, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      })
      .then((result) => {
        setContent(result.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (employeeName) => {
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
          {loading ? (
            <p>Loading...</p>
          ) : (
            content.map((item, index) => (
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
