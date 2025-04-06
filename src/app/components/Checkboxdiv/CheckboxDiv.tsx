"use client";
import styles from "./Checkboxdiv.module.scss";
import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import Image from "next/image";

type Props = {
  img?: string;
  text: string;
  color?: "blue" | "orange" | "yellow" | "pink";
  checked?: boolean;
  onChange?: () => void;
};

function CheckboxDiv(props: Props) {
  const image = (img: string) => {
    return <Image className={styles.photo} src={img} width={28} height={28} alt="pfp" />;
  };

  return (
    <div className={styles.div}>
      <CustomCheckbox
        color={props.color}
        checked={props.checked}
        onChange={props.onChange}
      />
      <div className={styles.content}>
        {props.img && <div className={styles.image}>{image(props.img)}</div>}
        <p>{props.text}</p>
      </div>
    </div>
  );
}

export default CheckboxDiv;
