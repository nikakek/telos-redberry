"use client";
import Card from "../Card/Card";
import styles from "./CardSection.module.scss";
import { Task } from "../contexts/TaskContext";

interface CardSectionProps {
  type: string;
  status: string;
  tasks: Task[];
}

const typeToColorClass: { [key: string]: string } = {
  starter: "yellow",
  inProgress: "orange",
  readyForTest: "pink",
  done: "blue",
};

export default function CardSection({ type, status, tasks }: CardSectionProps) {
  const filteredTasks = tasks.filter((task) => task.status.name === status);
  const colorClass = typeToColorClass[type] || "yellow";

  return (
    <div className={`${styles.section} ${filteredTasks.length === 0 ? styles.noTasks : ""}`}>
      <div className={styles.sectionDiv}>
        <div className={`${styles.title} ${styles[colorClass]}`}>
          <h2>{status}</h2>
        </div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} task={task} />
          ))
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
}