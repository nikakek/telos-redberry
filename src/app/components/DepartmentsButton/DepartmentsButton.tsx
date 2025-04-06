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

  const displayName = department.name.length > 10 ? department.name.slice(0, 10) + "..." : department.name;

  return (
    <div className={styles.button} style={{ backgroundColor: buttonColor }}>
      {displayName}
    </div>
  );
};

const getColorById = (id: number): string => {
  const colorMap: { [key: number]: string } = {
    1: "#FF5733", 
    2: "#33FF57",
    3: "#3357FF", 
    4: "#FFEB33",
    5: "#FF33A8", 
    6: "#57FF33", 
    7: "#33FFF5",
    8: "#F533FF", 
  };

  return colorMap[id] || "#B0B0B0";
};

export default DepartmentsButton;
