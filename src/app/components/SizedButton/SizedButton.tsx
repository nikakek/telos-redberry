import styles from "./SizedButton.module.scss";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  lvl: "low" | "medium" | "high";
  size: "big" | "small";
};

let text: string;
let img: string;
let color:  "red" | "darkYellow" | "green";

function SizedButton(props: Props) {

    switch(props.lvl) {
        case "high":
            text = "მაღალი"
            img = "/icons/High.svg";
            color = "red";
            break;
        case "medium":
            text = "საშუალო";
            img = "/icons/Medium.svg";
            color = "darkYellow";
            break;
        case "low":
            text = "დაბალი";
            img = "/icons/Low.svg";
            color = "green";
            break;
        default:
            text = "button";
            break;
    }
  return (
    <button className={clsx(styles.button, styles[props.size], styles[color])}>
      <Image src={img} alt="logo" width={16} height={18} className={styles.img}/>
      {text}
    </button>
  );
}

export default SizedButton;
