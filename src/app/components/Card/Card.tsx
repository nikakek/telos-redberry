"use client";
import { useRouter } from "next/navigation";
import SizedButton from "../SizedButton/SizedButton";
import DepartmentsButton from "../DepartmentsButton/DepartmentsButton";
import styles from "./Card.module.scss";
import Image from "next/image";
import { Task } from "../contexts/TaskContext";

interface CardProps {
  task: Task;
}

const statusToColorClass: { [key: string]: string } = {
  "დასაწყები": "yellow",
  "პროგრესში": "orange",
  "მზად ტესტირებისთვის": "pink",
  "დასრულებული": "blue",
};

export default function Card({ task }: CardProps) {
  const router = useRouter();

  const priorityLvl =
    task.priority.name.toLowerCase() === "დაბალი"
      ? "low"
      : task.priority.name.toLowerCase() === "საშუალო"
      ? "medium"
      : task.priority.name.toLowerCase() === "მაღალი"
      ? "high"
      : "low";

  const colorClass = statusToColorClass[task.status.name] || "yellow";

  const handleClick = () => {
    router.push(`/task-details/${task.id}`);
  };

  return (
    <div className={`${styles.cardDiv} ${styles[colorClass]}`} onClick={handleClick}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div>
            <SizedButton lvl={priorityLvl} size="small" />
            <DepartmentsButton department={task.department} />
          </div>
        </div>
        <div className={styles.centerDiv}>
          <h1 className={styles.h1}>{task.name}</h1>
          <p className={styles.p}>{task.description || "No description"}</p>
        </div>
        <div className={styles.bottomDiv}>
          <div className={styles.employee}>
            {task.employee.avatar ? (
              <img
                src={task.employee.avatar}
                alt="Employee Avatar"
                width={24}
                height={24}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatar} style={{ width: 24, height: 24 }} />
            )}
          </div>
          <div className={styles.bottomRight}>
            <div className={styles.date}>
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
            </div>
            <div className={styles.comments}>
              <Image src="/images/Comments.svg" width={16} height={16} alt="message" />
              <span>{task.comment_count ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}