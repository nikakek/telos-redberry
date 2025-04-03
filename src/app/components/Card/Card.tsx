// components/Card/Card.tsx

import React from "react";
import styles from "./Card.module.scss";
import SizedButton from "../SizedButton/SizedButton";
import DepartmentsButton from "../DepartmentsButton/DepartmentsButton";
import clsx from "clsx";
import Image from "next/image";

type Department = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  name: string;
  surname: string;
  avatar: string;
};

type Status = {
  id: number;
  name: string;
};

type Priority = {
  id: number;
  name: string;
  icon: string;
};

type TaskData = {
  id: number;
  name: string;
  description: string;
  due_date: string;
  department: Department;
  employee: Employee;
  status: Status;
  priority: Priority;
};

type Props = {
  color: string;
  lvl: "low" | "medium" | "high";
  taskData: TaskData;
};

function Card({ color, lvl, taskData }: Props) {
  let priorityColor: string;
  switch (lvl) {
    case "low":
      priorityColor = "green";
      break;
    case "medium":
      priorityColor = "darkYellow";
      break;
    case "high":
      priorityColor = "red";
      break;
    default:
      priorityColor = "grey";
  }

  return (
    <div className={clsx(styles.cardDiv, styles[color])}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div>
            <SizedButton lvl={lvl} size="small" />
            <DepartmentsButton department={taskData.department} />
          </div>
          <span className={styles.date}>
            {new Date(taskData.due_date).toLocaleDateString()}
          </span>
        </div>
        <div className={styles.centerDiv}>
          <h1 className={styles.h1}>{taskData.name}</h1>
          <p className={styles.p}>{taskData.description}</p>
        </div>
        <div className={styles.bottomDiv}>
          <Image
            src={taskData.employee.avatar}
            width={31}
            height={31}
            alt="pfp"
          />
          <div className={styles.comments}>
            <Image
              src="/images/Comments.svg"
              width={22}
              height={22}
              alt="comments"
            />
            <p>8</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
