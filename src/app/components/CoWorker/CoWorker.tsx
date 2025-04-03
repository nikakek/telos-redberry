"use client";
import { useState } from "react";
import styles from "./CoWorker.module.scss";
import Image from "next/image";
import clsx from "clsx";

type Props = {
  title: "დეპარტამენტი" | "პრიორიტეტი" | "თანამშრომელი";
  isActive: boolean;
};

function CoWorker(props: Props) {  
  return (
    <div
      className={clsx(styles.div, { [styles.active]: props.isActive })}
    >
      <h3>{props.title}</h3>
      <Image
        src="/icons/arrowDown.svg"
        width={14}
        height={8}
        alt="arrow"
        className={styles.image}
      />
    </div>
  );
}

export default CoWorker;
