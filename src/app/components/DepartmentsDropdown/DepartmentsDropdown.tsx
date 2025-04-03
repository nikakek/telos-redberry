import { useState, useEffect } from "react";
import axios from "axios";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "./DepartmentsDropdown.module.scss";

function DepartmentsDropdown() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    axios("https://momentum.redberryinternship.ge/api/departments")
      .then((result) => {
        setContent(result.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.content}>
        {content.map((item, index) => (
          <CheckboxDiv key={index} text={item.name} />
        ))}
      </div>
      <div className={styles.button}>
        <CustomButton border="rounded" text="არჩევა" background="background" />
      </div>
    </div>
  );
}

export default DepartmentsDropdown;
