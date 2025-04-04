"use client"
import React from "react";
import styles from "./Card.module.scss";
import SizedButton from "../SizedButton/SizedButton";
import DepartmentsButton from "../DepartmentsButton/DepartmentsButton";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  taskData: TaskData;
};

function Card({ color, taskData }: Props) {
  const router = useRouter();
  const priorityName = taskData.priority.name.toLowerCase();

  let priorityLvl: "low" | "medium" | "high" = "low";
  switch (priorityName) {
    case "დაბალი":
      priorityLvl = "low";
      break;
    case "საშუალო":
      priorityLvl = "medium";
      break;
    case "მაღალი":
      priorityLvl = "high";
      break;
    default:
      priorityLvl = "low";
      break;
  }

  const handleCardClick = () => {
    router.push(
      `/task-details?taskId=${taskData.id}&taskName=${encodeURIComponent(
        taskData.name
      )}&taskDescription=${encodeURIComponent(
        taskData.description
      )}&taskDueDate=${taskData.due_date}&taskEmployeeName=${encodeURIComponent(
        taskData.employee.name
      )}&taskEmployeeSurname=${encodeURIComponent(
        taskData.employee.surname
      )}&taskEmployeeAvatar=${encodeURIComponent(
        taskData.employee.avatar
      )}&taskPriorityName=${encodeURIComponent(
        taskData.priority.name
      )}&taskStatusName=${encodeURIComponent(taskData.status.name)}`
    );
  };

  return (
    <div
      className={clsx(styles.cardDiv, styles[color])}
      onClick={handleCardClick}
    >
      <div className={styles.content}>
        <div className={styles.top}>
          <div>
            <SizedButton lvl={priorityLvl} size="small" />
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
            className={styles.avatar}
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
