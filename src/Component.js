import React, { useEffect, useCallback, useState } from "react";
import { fabric } from "fabric";

const Component = () => {
  const [canvas, setCanvas] = useState(null);
  const [colorToggled, setColorToggle] = useState(false);
  const [color, setColor] = useState("");
  const [activeObj, setActiveObj] = useState("");
  useEffect(() => {
    if (!canvas) {
      setCanvas(
        new fabric.Canvas("canvasID", {
          backgroundColor: "#e7e7e7"
        })
      );
    }
    if (canvas) {
      canvas.on("selection:created", ({ selected }) => {
        setColor(selected[0].fill);
        setColorToggle(true);
        setActiveObj(canvas.getActiveObject());
        canvas.requestRenderAll();
      });
      canvas.on("selection:updated", ({ selected }) => {
        setColor(selected[0].fill);
        setColorToggle(true);
        setActiveObj(canvas.getActiveObject());
        canvas.requestRenderAll();
      });
      canvas.on("selection:cleared", () => {
        setColorToggle(false);
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
  const rec = useCallback(() => {
    const rect = new fabric.Rect({
      fill: "#252424",
      width: 100,
      height: 100
    });
    return canvas.add(rect);
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
          add rect
        </button>
        <button
          type="button"
          onClick={() => {
            console.log(canvas.getObjects());
          }}
        >
          get directions
        </button>
        {colorToggled && (
          <input
            type="color"
            value={color}
            onChange={e => changeColor(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default Component;
