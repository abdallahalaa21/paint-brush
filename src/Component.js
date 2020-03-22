/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fabric } from "fabric";

const Component = ({
  addPage,
  backgroundColor,
  selectedElement,
  keyChanges,
  id
}) => {
  const [canvas, setCanvas] = useState(null);
  useEffect(() => {
    if (!canvas) {
      const canvasElement = new fabric.Canvas(id, {
        backgroundColor
      });
      setCanvas(canvasElement);
      addPage(canvasElement);
    }
    if (canvas) {
      canvas.on("selection:created", ({ selected }) => {
        selectedElement(selected[0]);
        document.addEventListener("keydown", keyChanges);
      });
      canvas.on("selection:updated", ({ selected }) => {
        selectedElement(selected[0]);
      });
      canvas.on("selection:cleared", () => {
        selectedElement(null);
        document.removeEventListener("keydown", keyChanges);
      });
    }
  }, [canvas, backgroundColor, addPage, selectedElement, keyChanges, id]);

  return (
    <div style={{ margin: "20px" }}>
      <canvas id={id} width="800px" height="400px" />
    </div>
  );
};

Component.propTypes = {
  addPage: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  selectedElement: PropTypes.func.isRequired,
  keyChanges: PropTypes.func.isRequired
};

export default Component;
