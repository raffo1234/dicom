"use client";

import { Fragment, useState } from "react";

export default function Tabs({
  items,
}: {
  items: {
    label: string;
    children: React.ReactNode;
  }[];
}) {
  const [tabActive, setTabActive] = useState(0);

  const onClick = (key: number) => {
    setTabActive(key);
  };

  return (
    <>
      <nav className="z-10">
        {items.map(({ label }, index) => {
          return (
            <button
              key={index}
              className={`${index === tabActive ? "border-cyan-400" : "border-transparent"} border-b  py-4 px-6`}
              type="button"
              onClick={() => onClick(index)}
            >
              {label}
            </button>
          );
        })}
      </nav>
      <article className="py-6 z-20 border-t border-gray-200 -mt-[1px]">
        {items.map(({ children }, index) => {
          return index === tabActive ? (
            <Fragment key={index}>{children}</Fragment>
          ) : null;
        })}
      </article>
    </>
  );
}
