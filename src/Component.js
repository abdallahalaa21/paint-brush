import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { fabric } from "fabric";

const Component = ({
  addPage,
  backgroundColor,
  selectedElement,
  remove,
  setActivePage,
  id,
  activePage,
  deletePage
}) => {
  const [canvas, setCanvas] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const selectCanvas = useCallback(
    e => {
      const activeObj = canvas?.getActiveObject();
      if (
        e?.target?.parentNode?.parentNode?.id === `Container${id}` &&
        !activeObj
      ) {
        setIsSelected(true);
      } else if (
        e?.target?.parentNode?.parentNode?.id?.includes("Container") &&
        e?.target?.parentNode?.parentNode?.id !== `Container${id}`
      ) {
        canvas.discardActiveObject();
        canvas.renderAll();
        setIsSelected(false);
      } else {
        setIsSelected(false);
      }
    },
    [canvas, id]
  );

  useEffect(() => {
    document.addEventListener("click", selectCanvas);
    return () => {
      document.removeEventListener("click", selectCanvas);
    };
  }, [selectCanvas]);

  useEffect(() => {
    if (!canvas) {
      const canvasElement = new fabric.Canvas(id, {
        backgroundColor,
        id
      });
      setCanvas(canvasElement);
      addPage(canvasElement);
    }
    if (canvas) {
      const keyChanges = e => {
        if (
          (canvas.getActiveObject().get("type") === "i-text" &&
            canvas.getActiveObject().selected) ||
          canvas.getActiveObject().get("type") === "image" ||
          canvas.getActiveObject().get("type") === "rect"
        ) {
          switch (e.keyCode) {
            case 46:
              remove(canvas);
              break;
            case 39: // move right
              e.preventDefault();
              canvas.getActiveObject().left += 1;
              canvas.renderAll();
              break;
            case 37: // move left
              e.preventDefault();
              canvas.getActiveObject().left -= 1;
              canvas.renderAll();
              break;
            case 40: // move down
              e.preventDefault();
              canvas.getActiveObject().top += 1;
              canvas.renderAll();
              break;
            case 38: // move up
              e.preventDefault();
              canvas.getActiveObject().top -= 1;
              canvas.renderAll();
              break;
            default:
          }
        }
      };

      canvas.on("selection:created", ({ selected }) => {
        if (activePage !== canvas) {
          setActivePage(canvas);
        }
        selectedElement(selected[0]);
        document.addEventListener("keydown", keyChanges);
      });
      canvas.on("selection:updated", ({ selected }) => {
        if (activePage !== canvas) {
          setActivePage(canvas);
        }
        selectedElement(selected[0]);
      });
      canvas.on("selection:cleared", () => {
        selectedElement(null);
        document.removeEventListener("keydown", keyChanges);
      });
    }
  }, [
    canvas,
    backgroundColor,
    addPage,
    selectedElement,
    id,
    remove,
    setActivePage,
    activePage
  ]);

  return (
    <div
      id={`Container${id}`}
      style={{
        margin: "20px"
      }}
    >
      <button type="button" onClick={() => deletePage(id)}>
        Delete page
      </button>
      <canvas
        id={id}
        width="800px"
        height="400px"
        style={{ border: isSelected ? "1px solid black" : "none" }}
      />
    </div>
  );
};

Component.propTypes = {
  addPage: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  selectedElement: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  setActivePage: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  activePage: PropTypes.object.isRequired,
  deletePage: PropTypes.func.isRequired
};

export default Component;
