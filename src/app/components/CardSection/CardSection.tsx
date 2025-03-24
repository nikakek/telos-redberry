import styles from "./CardSection.module.scss";
import clsx from "clsx";
import Card from "../Card/Card";


type Props = {
  type: "starter" | "inProgress" | "readyForTest" | "done";
};

function CardSection(props: Props) {
  let color: string;
  let text: string;

  switch (props.type) {
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
        <Card color={color}/>
        <Card color={color}/>
        <Card color={color}/>
        <Card color={color}/>
      </div>
    </section>
  );
}

export default CardSection;
