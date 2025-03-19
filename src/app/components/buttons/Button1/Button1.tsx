import React from "react";
import clsx from "clsx";

type Props = {
  color: string;
  title: string;
};

const Button1 = (props: Props) => {
  return <button>{props.title}</button>;
};

export default Button1;
