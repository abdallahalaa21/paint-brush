/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback, useState } from "react";
import { fabric } from "fabric";

const Component = () => {
  const [canvas, setCanvas] = useState(null);
  const [colorToggled, setColorToggle] = useState(false);
  const [color, setColor] = useState("");
  const [activeObj, setActiveObj] = useState(null);
  const [backgroundColorToggled, setBackgroundColorToggled] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("");

  useEffect(() => {
    if (!canvas) {
      setCanvas(
        new fabric.Canvas("canvasID", {
          backgroundColor: "#e7e7e7"
        })
      );
    }
    if (canvas) {
      const fillColor = element => {
        setColor(element[0].fill);
        setColorToggle(true);
        setActiveObj(canvas.getActiveObject());
        canvas.requestRenderAll();
      };

      const fillBackground = element => {
        if (canvas.getActiveObject().get("type") === "i-text") {
          setBackgroundColorToggled(true);
          setBackgroundColor(element[0].backgroundColor);
        }
      };

      canvas.on("selection:created", ({ selected }) => {
        fillBackground(selected);
        fillColor(selected);
      });
      canvas.on("selection:updated", ({ selected }) => {
        fillBackground(selected);
        fillColor(selected);
      });
      canvas.on("selection:cleared", () => {
        setColorToggle(false);
        setBackgroundColorToggled(false);
        setActiveObj(null);
        canvas.renderAll();
      });
    }
  }, [canvas]);

  const changeColor = newColor => {
    setColor(newColor);
    activeObj.set({
      fill: newColor
    });
    canvas.renderAll();
  };

  const changeBackgroundColor = newColor => {
    setBackgroundColor(newColor);
    activeObj.set({
      backgroundColor: newColor
    });
    canvas.renderAll();
  };

  const rec = useCallback(() => {
    const rect = new fabric.Rect({
      fill: "#252424",
      width: 100,
      height: 100
    });
    return canvas.add(rect);
  }, [canvas]);

  const text = useCallback(() => {
    const textElement = new fabric.IText("hello", {
      fontSize: "28",
      fill: "#252424"
    });
    return canvas.add(textElement);
  }, [canvas]);

  const remove = useCallback(() => {
    canvas.remove(canvas.getActiveObject());
  }, [canvas]);

  return (
    <div style={{ marginLeft: "200px" }}>
      <div
        style={{
          boxShadow: "0 1px 3px 1px rgba(0, 0, 0, 0.16)",
          height: "100vh",
          width: "100%"
        }}
      >
        <p>presentation test</p>
        <canvas id="canvasID" width="800px" height="300px" />

        <button type="button" onClick={() => rec()}>
          add rectangle
        </button>

        <button type="button" onClick={() => text()}>
          add text
        </button>

        <button
          type="button"
          onClick={() => {
            console.log(canvas.getObjects());
          }}
        >
          get directions
        </button>

        {activeObj && (
          <button type="button" onClick={() => remove()}>
            Delete
          </button>
        )}

        {colorToggled && (
          <label>
            Change Color
            <input
              type="color"
              value={color}
              onChange={e => changeColor(e.target.value)}
            />
          </label>
        )}

        {backgroundColorToggled && (
          <label>
            Change background color
            <input
              type="color"
              value={backgroundColor}
              onChange={e => changeBackgroundColor(e.target.value)}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default Component;
