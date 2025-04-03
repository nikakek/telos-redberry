import { useState, useEffect } from "react";
import styles from "./SizedButton.module.scss";
import clsx from "clsx";
import Image from "next/image";
import axios from "axios";
import config from "../../Config/Config";

type Props = {
  lvl: "low" | "medium" | "high";
  size: "big" | "small";
};

let text: string;
let img: string;
let color: "red" | "darkYellow" | "green";

function SizedButton(props: Props) {
  const [priorities, setPriorities] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the priorities data using config values
    axios
      .get(`${config.serverUrl}/priorities`, {
        headers: {
          Authorization: `Bearer ${config.token}`, // Add token in the Authorization header
        },
      })
      .then((response) => {
        setPriorities(response.data); // Store the data in the state
      })
      .catch((error) => {
        console.error("Error fetching priorities:", error);
      });
  }, []);

  // Set text, img, and color based on the lvl prop and fetched priorities data
  switch (props.lvl) {
    case "high":
      const highPriority = priorities.find((p) => p.name === "High");
      text = highPriority ? highPriority.name : "მაღალი";
      img = highPriority ? highPriority.icon : "/icons/High.svg";
      color = "red";
      break;
    case "medium":
      const mediumPriority = priorities.find((p) => p.name === "Medium");
      text = mediumPriority ? mediumPriority.name : "საშუალო";
      img = mediumPriority ? mediumPriority.icon : "/icons/Medium.svg";
      color = "darkYellow";
      break;
    case "low":
      const lowPriority = priorities.find((p) => p.name === "Low");
      text = lowPriority ? lowPriority.name : "დაბალი";
      img = lowPriority ? lowPriority.icon : "/icons/Low.svg";
      color = "green";
      break;
    default:
      text = "button";
      break;
  }

  return (
    <button className={clsx(styles.button, styles[props.size], styles[color])}>
      <Image src={img} alt="logo" width={16} height={18} className={styles.img} />
      {text}
    </button>
  );
}

export default SizedButton;
