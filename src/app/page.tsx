import clsx from "clsx";
import CustomButton from "./components/CustomButton/CustomButton";
import AnswerButton from "./components/AnswerButton/AnswerButton";
import ColoredButton from "./components/ColoredButton/ColoredButton";
import SizedButton from "./components/SizedButton/SizedButton";
import Person from "./components/Person/Person";
import AddWorker from "./components/AddWorker/AddWorker";
import AddedWorker from "./components/AddedWorker/AddedWorker";
import Header from "./components/Header/Header";
import CardSection from "./components/CardSection/CardSection";
import PersonCheckbox from "./components/CustomCheckbox/CustomCheckbox";
import CustomCheckbox from "./components/CustomCheckbox/CustomCheckbox"

export default function Home() {
  return (
    <>
      <Header />
      <CustomCheckbox color="blue" />
    </>
  );
}
