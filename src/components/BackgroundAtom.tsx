import React from "react";
import "./BackgroundAtom.css";

const BackgroundAtom: React.FC = () => (
  <div className="background-atom">
    <svg
      className="background-atom-svg"
      viewBox="0 0 200 200"
      width="600"
      height="600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        className="orbit orbit1"
        cx="100"
        cy="100"
        rx="80"
        ry="30"
        fill="none"
        stroke="hsl(var(--primary) / 0.25)"
        strokeWidth="4"
      />
      <ellipse
        className="orbit orbit2"
        cx="100"
        cy="100"
        rx="80"
        ry="30"
        fill="none"
        stroke="hsl(var(--primary) / 0.25)"
        strokeWidth="4"
      />
      <ellipse
        className="orbit orbit3"
        cx="100"
        cy="100"
        rx="80"
        ry="30"
        fill="none"
        stroke="hsl(var(--primary) / 0.25)"
        strokeWidth="4"
      />
      {/* <text
        x="100"
        y="110"
        textAnchor="middle"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))"
        fontFamily="sans-serif"
        opacity="0.2"
      >
        FOCUS
      </text> */}
    </svg>
  </div>
);

export default BackgroundAtom; 