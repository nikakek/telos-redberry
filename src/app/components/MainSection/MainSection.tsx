"use client";
import CardSection from "../CardSection/CardSection";
import { useState } from "react";
import CoWorker from "../CoWorker/CoWorker";
import styles from "./MainSection.module.scss";

function MainSection() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  try {
    const response = await fetch(
      "https://momentum.redberryinternship.ge/api/departments"
    );

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }

  return (
    <div className={styles.mainDiv}>
      <h1 className={styles.title}>დავალებების გვერდი</h1>
      <div className={styles.dropDown}>
        <div onClick={toggleDropdown}>
          <CoWorker title="დეპარტამენტი" />
        </div>
        <div onClick={toggleDropdown}>
          <CoWorker title="პრიორიტეტი" />
        </div>
        <div onClick={toggleDropdown}>
          <CoWorker title="თანამშრომელი" />
        </div>
        {isOpen && <div className="dropdown-content"></div>}
      </div>

      <div className={styles.cards}>
        <CardSection type="starter" />
        <CardSection type="inProgress" />
        <CardSection type="readyForTest" />
        <CardSection type="done" />
      </div>
    </div>
  );
}

export default MainSection;
