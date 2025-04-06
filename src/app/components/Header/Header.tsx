"use client";
import Link from "next/link";
import CustomButton from "../CustomButton/CustomButton";
import styles from "./Header.module.scss";
import Image from "next/image";
import { useState } from "react";
import AddEmployee from "../AddEmployee/AddEmployee";

function Header() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const openForm = () => {
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.div}>
          <Link href="/">
            <Image
              src="./images/headerLogo.svg"
              width={210}
              height={38}
              alt="logo"
            />
          </Link>
          <div className={styles.buttonDiv}>
            <CustomButton
              text="თანამშრომლის შექმნა"
              background="outline"
              border="square"
              onClick={openForm}
            />
            <CustomButton
              text="+ შექმენი ახალი დავალება"
              background="background"
              border="square"
            />
          </div>
        </div>
      </header>

      {isFormVisible && <AddEmployee onClose={closeForm} />}
    </>
  );
}

export default Header;