"use client";

import { useState, useEffect } from "react";
import CardSection from "../CardSection/CardSection";
import CoWorker from "../CoWorker/CoWorker";
import styles from "./MainSection.module.scss";
import DepartmentsDropdown from "../DepartmentsDropdown/DepartmentsDropdown";
import PrioritiesDropdown from "../PrioritiesDropdown/PrioritiesDropdown";
import EmployeesDropdown from "../EmployeesDropdown/EmployeesDropdown";
import config from "../../Config/Config"; // ✅ import your config file

function MainSection() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.dropDown}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${config.serverUrl}/tasks`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        });
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className={styles.mainDiv}>
      <h1 className={styles.title}>დავალებების გვერდი</h1>

      <div className={styles.dropDown}>
        <div
          className={`${styles.button} ${
            openDropdown === "departments" ? styles.active : ""
          }`}
          onClick={() => handleDropdownToggle("departments")}
        >
          <CoWorker title="დეპარტამენტი" isActive={openDropdown === "departments"} />
        </div>
        <div
          className={`${styles.button} ${
            openDropdown === "priorities" ? styles.active : ""
          }`}
          onClick={() => handleDropdownToggle("priorities")}
        >
          <CoWorker title="პრიორიტეტი" isActive={openDropdown === "priorities"} />
        </div>
        <div
          className={`${styles.button} ${
            openDropdown === "employees" ? styles.active : ""
          }`}
          onClick={() => handleDropdownToggle("employees")}
        >
          <CoWorker title="თანამშრომელი" isActive={openDropdown === "employees"} />
        </div>

        {openDropdown === "departments" && (
          <div className={styles.position}>
            <DepartmentsDropdown />
          </div>
        )}
        {openDropdown === "priorities" && (
          <div className={styles.position}>
            <PrioritiesDropdown />
          </div>
        )}
        {openDropdown === "employees" && (
          <div className={styles.position}>
            <EmployeesDropdown />
          </div>
        )}
      </div>

      <div className={styles.cards}>
        <CardSection
          type="starter"
          tasks={tasks.filter((task) => task.status?.name === "დასაწყები")}
        />
        <CardSection
          type="inProgress"
          tasks={tasks.filter((task) => task.status?.name === "პროგრესში")}
        />
        <CardSection
          type="readyForTest"
          tasks={tasks.filter((task) => task.status?.name === "მზად ტესტირებისთვის")}
        />
        <CardSection
          type="done"
          tasks={tasks.filter((task) => task.status?.name === "დასრულებული")}
        />
      </div>
    </div>
  );
}

export default MainSection;