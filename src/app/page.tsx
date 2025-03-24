import clsx from "clsx";
import CustomButton from "./components/buttons/CustomButton/CustomButton";
import TextButton from "./components/buttons/TextButton/TextButton";

export default function Home() {
  return (
    <>
      <CustomButton
        text="+ შექმენი ახალი დავალება"
        background="background"
        border="squared"
      />
      <CustomButton
        text="+ შექმენი ახალი დავალება"
        background="outline"
        border="squared"
      />
      <CustomButton text="button" background="background" border="rounded" />
      <TextButton text="უპასუხე" img="/icons/reply.svg" />
    </>
  );
}
