import styles from "./DepartmentsButton.module.scss";
import React from "react";

type Department = {
  id: number;
  name: string;
};

type Props = {
  department: Department;
};

const DepartmentsButton = ({ department }: Props) => {
  const buttonColor = getColorById(department.id);

  // Slice the department name to show only the first 10 characters, and add "..." if it's longer
  const displayName = department.name.length > 10 ? department.name.slice(0, 10) + "..." : department.name;

  return (
    <div className={styles.button} style={{ backgroundColor: buttonColor }}>
      {displayName}
    </div>
  );
};

const getColorById = (id: number): string => {
  const colorMap: { [key: number]: string } = {
    1: "#FF5733", // Example red for "Administration"
    2: "#33FF57", // Green for "HR"
    3: "#3357FF", // Blue for "Finance"
    4: "#FFEB33", // Yellow for "Sales & Marketing"
    5: "#FF33A8", // Pink for "Logistics"
    6: "#57FF33", // Light green for "Technology"
    7: "#33FFF5", // Cyan for "Media"
    8: "#F533FF", // Purple for "Design"
  };

  return colorMap[id] || "#B0B0B0"; // Grey if ID is not in the map
};

export default DepartmentsButton;
