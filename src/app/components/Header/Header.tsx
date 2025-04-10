"use client";
import Link from "next/link";
import CustomButton from "../CustomButton/CustomButton";
import styles from "./Header.module.scss";
import Image from "next/image";
import { useState } from "react";
import AddEmployee from "../AddEmployee/AddEmployee";
import { useRouter } from "next/navigation";

function Header() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const router = useRouter();

  const openForm = () => {
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
  };

  const handleAddTask = () => {
    router.push("/Add-task");
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.div}>
          <Link href="/">
            <Image
              src="/images/headerLogo.svg"
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
              onClick={handleAddTask}
            />
          </div>
        </div>
      </header>

      {isFormVisible && <AddEmployee onClose={closeForm} />}
    </>
  );
}

export default Header;