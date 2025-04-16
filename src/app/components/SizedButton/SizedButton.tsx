"use client";
import styles from "./SizedButton.module.scss";
import clsx from "clsx";
import Image from "next/image";
import { useTasks } from "../contexts/TaskContext";

type Props = {
  lvl: "low" | "medium" | "high";
  size: "big" | "small";
};

function SizedButton(props: Props) {
  const { priorities } = useTasks();

  // Capitalize the lvl to match API names ("Low", "Medium", "High")
  const priorityName = props.lvl.charAt(0).toUpperCase() + props.lvl.slice(1);
  const priority = priorities.find((p) => p.name === priorityName);

  let text: string;
  let img: string;
  let color: "red" | "darkYellow" | "green";

  switch (props.lvl) {
    case "high":
      text = priority ? "მაღალი" : "მაღალი";
      img = priority ? priority.icon : "/icons/High.svg";
      color = "red";
      break;
    case "medium":
      text = priority ? "საშუალო" : "საშუალო";
      img = priority ? priority.icon : "/icons/Medium.svg";
      color = "darkYellow";
      break;
    case "low":
      text = priority ? "დაბალი" : "დაბალი";
      img = priority ? priority.icon : "/icons/Low.svg";
      color = "green";
      break;
    default:
      text = "button";
      img = "/icons/Low.svg";
      color = "green";
      break;
  }

  return (
    <button className={clsx(styles.button, styles[props.size], styles[color])}>
      <Image
        src={img}
        alt="logo"
        width={16}
        height={18}
        className={styles.img}
      />
      {text}
    </button>
  );
}

export default SizedButton;