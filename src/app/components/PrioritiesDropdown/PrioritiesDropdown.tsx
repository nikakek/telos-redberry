import { useState, useEffect } from "react";
import axios from "axios";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";

function PrioritiesDropdown() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className={styles.section}>
      <div className={styles.crop}>
        <div className={styles.content}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            content.map((item, index) => (
              <CheckboxDiv key={index} text={item.name} />
            ))
          )}
        </div>
        <div className={styles.button}>
          <CustomButton border="rounded" text="არჩევა" background="background" />
        </div>
      </div>
    </div>
  );
}

export default PrioritiesDropdown;
