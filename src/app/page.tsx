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
import CoWorker from "./components/CoWorker/CoWorker";
import Filter from "./components/Filter/Filter";
import CheckboxDiv from "./components/Checkboxdiv/CheckboxDiv";
import Comment from "./components/Comment/Comment";
import Dropdown from "./components/Dropdown/Dropdown";


export default function Home() {
  return (
    <>
      <Header />
      <Dropdown min={3} max={300} text="პასუხისმგებელი თანამშრომელი*"/>
    </>
  );
}
