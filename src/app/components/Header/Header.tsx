import CustomButton from "../CustomButton/CustomButton";
import styles from "./Header.module.scss"
import Image from "next/image";


function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.div}>
        <Image src='./images/headerLogo.svg' width={210} height={38} alt="logo"/>
        <div className={styles.buttonDiv}>
          <CustomButton
            text="თანამშრომლის შექმნა"
            background="outline"
            border="squared"
          />
          <CustomButton
            text="+ შექმენი ახალი დავალება"
            background="background"
            border="squared"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
