import styles from "./Filter.module.scss";
import CustomButton from "../CustomButton/CustomButton";
import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import CheckboxDiv from "../Checkboxdiv/CheckboxDiv";

function Filter() {
  return (
    <div className={styles.div}>
      <div className={styles.box}>
        <div className={styles.content}>
          <CheckboxDiv text="მარკეტინგის დეპარტამენტი" color="orange" />
          <CheckboxDiv text="დიზაინის დეპარტამენტი" color="pink" />
          <CheckboxDiv text="ლოჯისტიკის დეპარტამენტი" color="blue" />
          <CheckboxDiv text="IT დეპარტამენტი" color="yellow" />
        </div>
        <div className={styles.button}>
          <CustomButton
            background="background"
            border="rounded"
            text="არჩევა"
          />
        </div>
      </div>
    </div>
  );
}

export default Filter;
