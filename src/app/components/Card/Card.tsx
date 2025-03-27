import ColoredButton from "../ColoredButton/ColoredButton";
import SizedButton from "../SizedButton/SizedButton";
import styles from "./Card.module.scss";
import Image from "next/image";
import clsx from "clsx";

type Props = {
  color: string;
  lvl: "low" | "medium" | "high";
};

function Card(props: Props) {
  let color: string;
  switch(props.lvl) {
    case "low":
      color = "green"
      break;
    case "medium":
      color = "darkYellow"
      break;
    case "high":
      color = "red"
      break;
    default:
      color = "grey";
  }

  return (
    <div className={clsx(styles.cardDiv, styles[props.color])}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div>
            <SizedButton lvl={props.lvl} size="small" />
            <ColoredButton color="pink" />
          </div>
          <span className={styles.date}>22 იანვ, 2022</span>
        </div>
        <div className={styles.centerDiv}>
          <h1 className={styles.h1}>Redberry-ს საიტის ლენდინგის დიზაინი</h1>
          <p className={styles.p}>
            შექმენი საიტის მთავარი გვერდი, რომელიც მოიცავს მთავარ სექციებს,
            ნავიგაციას.
          </p>
        </div>
        <div className={styles.bottomDiv}>
          <Image src='./images/pfp.svg' width={31} height={31} alt="pfp" />
          <div className={styles.comments}>
            <Image src='./images/Comments.svg' width={22} height={22} alt="comments" />
            <p>8</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
