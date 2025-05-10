"use client";

import React from "react";

const UrlCell = ({ value }: { value: string | null }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={`w-[200px] cursor-pointer px-1 ${
        expanded
          ? "whitespace-normal break-words"
          : "overflow-hidden text-ellipsis whitespace-nowrap"
      }`}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <a href={value ?? undefined} target="_blank">
        {value}
      </a>
    </div>
  );
};

export default UrlCell;
