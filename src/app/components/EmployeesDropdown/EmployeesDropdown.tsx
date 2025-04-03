import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../DepartmentsDropdown/DepartmentsDropdown.module.scss";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";
import CustomButton from "../CustomButton/CustomButton";
import config from "../../Config/Config";  // Import the config
import Image from "next/image"

function EmployeesDropdown() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${config.serverUrl}/employees`, {
        headers: {
          Authorization: `Bearer ${config.token}`,  // Add Authorization header
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

  return (
    <div className={styles.section}>
      <div className={styles.crop}>
        <div className={styles.content}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            content.map((item, index) => (
              <div key={index} className={styles.employeeItem}>
                <Image 
                  src={item.avatar} 
                  alt={`${item.name} ${item.surname}`} 
                  className={styles.avatar}
                  width={30}
                  height={30} 
                />
                <span className={styles.name}>{item.name}</span>
                <span className={styles.surname}>{item.surname}</span>
              </div>
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

export default EmployeesDropdown;
