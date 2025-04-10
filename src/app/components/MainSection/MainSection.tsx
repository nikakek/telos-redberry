"use client";
import { useState, useEffect } from "react";
import CardSection from "../CardSection/CardSection";
import CoWorker from "../CoWorker/CoWorker";
import styles from "./MainSection.module.scss";
import DepartmentsDropdown from "../DepartmentsDropdown/DepartmentsDropdown";
import PrioritiesDropdown from "../PrioritiesDropdown/PrioritiesDropdown";
import EmployeesDropdown from "../EmployeesDropdown/EmployeesDropdown";
import Person from "../Person/Person";
import AddEmployee from "../AddEmployee/AddEmployee";
import { useTasks } from "../contexts/TaskContext";

interface MainSectionProps {
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  handleEmployeeAdded: () => void;
  refreshEmployeesTrigger: number;
}

function MainSection({
  isAddEmployeeOpen,
  setIsAddEmployeeOpen,
  handleEmployeeAdded,
  refreshEmployeesTrigger,
}: MainSectionProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const { tasks } = useTasks();

  useEffect(() => {
    console.log("Tasks in MainSection:", tasks);
    if (tasks.length > 0) {
      setLoading(false);
    }
  }, [tasks]);

  const handleDropdownToggle = (dropdown: string | null) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(`.${styles.dropDown}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDepartmentsSelect = (departments: string[]) => {
    setSelectedDepartments(departments);
    setOpenDropdown(null);
  };

  const handleEmployeesSelect = (employees: string[]) => {
    setSelectedEmployees(employees);
    setOpenDropdown(null);
  };

  const handlePrioritiesSelect = (priorities: string[]) => {
    setSelectedPriorities(priorities);
    setOpenDropdown(null);
  };

  if (loading) return <div>Loading tasks...</div>;

  const allSelectedItems = [
    ...selectedDepartments.map((value) => ({ type: "department", value })),
    ...selectedEmployees.map((value) => ({ type: "employee", value })),
    ...selectedPriorities.map((value) => ({ type: "priority", value })),
  ];

  const filteredTasks =
    selectedDepartments.length > 0 ||
    selectedEmployees.length > 0 ||
    selectedPriorities.length > 0
      ? tasks.filter(
          (task) =>
            (selectedDepartments.length === 0 ||
              selectedDepartments.includes(task.department?.name)) &&
            (selectedEmployees.length === 0 ||
              selectedEmployees.includes(
                `${task.employee?.name} ${task.employee?.surname}`
              )) &&
            (selectedPriorities.length === 0 ||
              selectedPriorities.includes(task.priority?.name))
        )
      : tasks;

  const handleRemoveItem = (type: string, value: string) => {
    switch (type) {
      case "department":
        setSelectedDepartments((prev) => prev.filter((d) => d !== value));
        break;
      case "employee":
        setSelectedEmployees((prev) => prev.filter((e) => e !== value));
        break;
      case "priority":
        setSelectedPriorities((prev) => prev.filter((p) => p !== value));
        break;
    }
  };

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
            <EmployeesDropdown
              onSelect={handleEmployeesSelect}
              refreshTrigger={refreshEmployeesTrigger}
            />
          </div>
        )}
      </div>

      <div className={styles.filter}>
        {allSelectedItems.map((item, index) => (
          <Person
            key={index}
            text={item.value}
            onRemove={() => handleRemoveItem(item.type, item.value)}
          />
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
          key={`starter-${tasks.length}`}
          type="starter"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "დასაწყები"
          )}
        />
        <CardSection
          key={`inProgress-${tasks.length}`}
          type="inProgress"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "პროგრესში"
          )}
        />
        <CardSection
          key={`readyForTest-${tasks.length}`}
          type="readyForTest"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "მზად ტესტირებისთვის"
          )}
        />
        <CardSection
          key={`done-${tasks.length}`}
          type="done"
          tasks={filteredTasks.filter(
            (task) => task.status?.name === "დასრულებული"
          )}
        />
      </div>

      {isAddEmployeeOpen && (
        <AddEmployee
          onClose={() => setIsAddEmployeeOpen(false)}
          onEmployeeAdded={handleEmployeeAdded}
        />
      )}
    </div>
  );
}

export default MainSection;