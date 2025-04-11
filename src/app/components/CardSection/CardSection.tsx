import styles from "./CardSection.module.scss";
import clsx from "clsx";
import Card from "../Card/Card";

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
  type: "starter" | "inProgress" | "readyForTest" | "done";
  tasks?: TaskData[];
};

function CardSection({ type, tasks = [] }: Props) {
  let color: string;
  let text: string;

  switch (type) {
    case "starter":
      color = "yellow";
      text = "დასაწყები";
      break;
    case "inProgress":
      color = "orange";
      text = "პროგრესში";
      break;
    case "readyForTest":
      color = "pink";
      text = "მზად ტესტირებისთვის";
      break;
    case "done":
      color = "blue";
      text = "დასრულებული";
      break;
    default:
      color = "grey";
      text = "";
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionDiv}>
        <div className={clsx(styles.title, styles[color])}>{text}</div>
        {tasks.length === 0 ? (
          <p className={styles.noTasks}>დავალება არ მოიძებნა</p>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} color={color} taskData={task} />
          ))
        )}
      </div>
    </section>
  );
}

export default CardSection;