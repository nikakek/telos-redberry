import ColoredButton from "../components/ColoredButton/ColoredButton";
import SizedButton from "../components/SizedButton/SizedButton";
import styles from "./page.module.scss";
import Image from "next/image";
import StatusDropdown from "../components/StatusDropdown/StatusDropdown";
import CustomButton from "../components/CustomButton/CustomButton";
import Comment from "../components/Comment/Comment"

export default function Home() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.infoDiv}>
          <div className={styles.lvl}>
            <SizedButton lvl="medium" size="big" />
            <ColoredButton color="pink" />
          </div>
          <div className={styles.task}>
            <h1>Redberry-ს საიტის ლენდინგის დიზაინი</h1>
            <p>
              მიზანია რომ შეიქმნას თანამედროვე, სუფთა და ფუნქციონალური დიზაინი,
              რომელიც უზრუნველყოფს მარტივ ნავიგაციას და მკაფიო ინფორმაციის
              გადაცემას. დიზაინი უნდა იყოს ადაპტირებადი (responsive), გამორჩეული
              ვიზუალით, მინიმალისტური სტილით და ნათელი ტიპოგრაფიით.
            </p>
          </div>
          <div className={styles.taskDetails}>
            <h2>დავალების დეტალები</h2>
            <div className={styles.status}>
              <div className={styles.stats}>
                <Image
                  src="../icons/pie-chart.svg"
                  width={24}
                  height={24}
                  alt="chart"
                />
                <p>სტატუსი</p>
              </div>
              <div className={styles.block}>
                <StatusDropdown />
              </div>
            </div>
            <div className={styles.employee}>
              <div className={styles.stats}>
                  <Image
                    src="../icons/stickman.svg"
                    width={24}
                    height={24}
                    alt="chart"
                  />
                  <p>თანამშრომელი</p>
                  </div>
                <div className={styles.employeeInfo}>
                  <Image
                    src="../images/pfp.svg"
                    className={styles.pfp}
                    width={32}
                    height={32}
                    alt="pfp"
                  />
                  <div className={styles.employeeInfoText}>
                    <p>დიზაინის დეპარტამენტი</p>
                    <p>ელაია ბაგრატიონი</p>
                  </div>
                </div>
            </div>
            <div className={styles.deadline}>
              <div className={styles.stats}>
                <Image
                  src="../icons/calendar.svg"
                  width={24}
                  height={24}
                  alt="chart"
                />
                <p>დავალების ვადა</p>
              </div>
              <div className={styles.date}>ორშ - 02/2/2025</div>
            </div>
          </div>
        </div>
        <div className={styles.commentsDiv}>
            <div className={styles.addComment}>
                <input type="text" placeholder="დაწერე კომენტარი"/>
                <div>
                    <CustomButton background="background" text="დააკომენტარე" border="rounded"/>
                </div>
            </div>
            <div className={styles.comments}>
                <div className={styles.commentsCounter}>
                    <h2>კომენტარები</h2>
                    <span>3</span>
                </div>
                <div className={styles.comment}>
                    <Comment img="../images/pfp.svg" name="ემილია მორგანი" text="gelaasddddddddddddddddddddddddddddddddasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadddddddd" answer={true} />
                </div>
            </div>
        </div>
      </section>
    </>
  );
}
