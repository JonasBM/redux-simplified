import React from "react";

interface Props {
  fetching: number;
  children?: React.ReactNode;
}

export const LoadingIndicator: React.FC<Props> = ({
  fetching = 0,
  children,
}) => {
  if (fetching > 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          background: "rgba(0,0,0,0.7)",
          content: "Loading...",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          {children ? children : "Loading"}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
