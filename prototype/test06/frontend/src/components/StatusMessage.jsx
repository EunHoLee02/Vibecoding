import React from "react";

export function StatusMessage({ tone = "neutral", title, message }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`status-message status-message--${tone}`}>
      {title ? <strong>{title}</strong> : null}
      <p>{message}</p>
    </div>
  );
}
