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
  დასაწყები: "yellow",
  პროგრესში: "orange",
  "მზად ტესტირებისთვის": "pink",
  დასრულებული: "blue",
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

  // Manual mapping of English month names to Georgian
  const georgianMonths: { [key: string]: string } = {
    January: "იანვარი",
    February: "თებერვალი",
    March: "მარტი",
    April: "აპრილი",
    May: "მაი",
    June: "ივნისი",
    July: "ივლისი",
    August: "აგვისტო",
    September: "სექტემბერი",
    October: "ოქტომბერი",
    November: "ნოემბერი",
    December: "დეკემბერი",
  };

  // Format the date manually
  const formattedDate = task.due_date
    ? (() => {
        const date = new Date(task.due_date);
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "long" });
        const year = date.getFullYear();
        const georgianMonth = georgianMonths[month] || month;
        return `${day} ${georgianMonth}, ${year}`;
      })()
    : "No due date";

  return (
    <div
      className={`${styles.cardDiv} ${styles[colorClass]}`}
      onClick={handleClick}
    >
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
              <div
                className={styles.avatar}
                style={{ width: 24, height: 24 }}
              />
            )}
          </div>
          <div className={styles.bottomRight}>
            <div className={styles.date}>
              <span>{formattedDate}</span>
            </div>
            <div className={styles.comments}>
              <Image
                src="/images/Comments.svg"
                width={16}
                height={16}
                alt="message"
              />
              <span>{task.comment_count ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
