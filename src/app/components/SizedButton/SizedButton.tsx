import styles from "./SizedButton.module.scss";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  color: "red" | "darkYellow" | "green";
  size: "big" | "small";
};

let text: string;
let img: string;

function SizedButton(props: Props) {

    switch(props.color) {
        case "red":
            text = "მაღალი"
            img = "/icons/High.svg";
            break;
        case "darkYellow":
            text = "საშუალო";
            img = "/icons/Medium.svg";
            break;
        case "green":
            text = "დაბალი";
            img = "/icons/Low.svg";
            break;
        default:
            text = "button";
            break;
    }
  return (
    <button className={clsx(styles.button, styles[props.size], styles[props.color])}>
      <Image src={img} alt="logo" width={16} height={18} className={styles.img}/>
      {text}
    </button>
  );
}

export default SizedButton;
