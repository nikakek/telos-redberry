"use client";
import { useState, useEffect } from "react";
import CardSection from "../CardSection/CardSection";
import CoWorker from "../CoWorker/CoWorker";
import styles from "./MainSection.module.scss";
import DepartmentsDropdown from "../DepartmentsDropdown/DepartmentsDropdown";
import PrioritiesDropdown from "../PrioritiesDropdown/PrioritiesDropdown";
import EmployeesDropdown from "../EmployeesDropdown/EmployeesDropdown";
import config from "../../Config/Config";
import Person from "../Person/Person";

function MainSection() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

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

  const handleDepartmentsSelect = (departments) => {
    console.log("Received departments:", departments);
    setSelectedDepartments(departments);
    setOpenDropdown(null);
  };

  const handleEmployeesSelect = (employees) => {
    console.log("Received employees:", employees);
    setSelectedEmployees(employees);
    setOpenDropdown(null);
  };

  const handlePrioritiesSelect = (priorities) => {
    console.log("Received priorities:", priorities);
    setSelectedPriorities(priorities);
    setOpenDropdown(null);
  };

  if (loading) return <div>Loading tasks...</div>;

  console.log("Current selectedDepartments:", selectedDepartments);
  console.log("Current selectedEmployees:", selectedEmployees);
  console.log("Current selectedPriorities:", selectedPriorities);

  const allSelectedItems = [
    ...selectedDepartments,
    ...selectedEmployees,
    ...selectedPriorities,
  ];

  // Filter tasks based on selected departments and priorities
  const filteredTasks =
    selectedDepartments.length > 0 || selectedPriorities.length > 0
      ? tasks.filter(
          (task) =>
            (selectedDepartments.length === 0 ||
              selectedDepartments.includes(task.department.name)) &&
            (selectedPriorities.length === 0 ||
              selectedPriorities.includes(task.priority.name))
        )
      : tasks;

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
          <CoWorker
            title="დეპარტამენტი"
            isActive={openDropdown === "departments"}
          />
        </div>
        <div
          className={`${styles.button} ${
            openDropdown === "priorities" ? styles.active : ""
          }`}
          onClick={() => handleDropdownToggle("priorities")}
        >
          <CoWorker
            title="პრიორიტეტი"
            isActive={openDropdown === "priorities"}
          />
        </div>
        <div
          className={`${styles.button} ${
            openDropdown === "employees" ? styles.active : ""
          }`}
          onClick={() => handleDropdownToggle("employees")}
        >
          <CoWorker
            title="თანამშრომელი"
            isActive={openDropdown === "employees"}
          />
        </div>

        {openDropdown === "departments" && (
          <div className={styles.position}>
            <DepartmentsDropdown onSelect={handleDepartmentsSelect} />
          </div>
        )}
        {openDropdown === "priorities" && (
          <div className={styles.position}>
            <PrioritiesDropdown onSelect={handlePrioritiesSelect} />
          </div>
        )}
        {openDropdown === "employees" && (
          <div className={styles.position}>
            <EmployeesDropdown onSelect={handleEmployeesSelect} />
          </div>
        )}
      </div>

      <div className={styles.filter}>
        {allSelectedItems.map((item, index) => (
          <Person key={index} text={item} />
        ))}
        {allSelectedItems.length > 0 && (
          <button
            className={styles.filterButton}
            onClick={() => {
              setSelectedDepartments([]);
              setSelectedEmployees([]);
              setSelectedPriorities([]);
            }}
          >
            გასუფთავება
          </button>
        )}
      </div>

      <div className={styles.cards}>
        <CardSection
          type="starter"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "დასაწყები"
          )}
        />
        <CardSection
          type="inProgress"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "პროგრესში"
          )}
        />
        <CardSection
          type="readyForTest"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "მზად ტესტირებისთვის"
          )}
        />
        <CardSection
          type="done"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "დასრულებული"
          )}
        />
      </div>
    </div>
  );
}

export default MainSection;
