import React from "react";
import "../styling/Alert.css";

interface AlertProps {
  message: string;
  type: "success";
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-text">{message}</span>
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default Alert;
