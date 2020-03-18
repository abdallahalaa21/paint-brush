/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { fabric } from "fabric";

const Component = () => {
  const [canvas, setCanvas] = useState(null);
  const [colorToggled, setColorToggle] = useState(false);
  const [color, setColor] = useState("");
  const [activeObj, setActiveObj] = useState(null);
  const [backgroundColorToggled, setBackgroundColorToggled] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("");

  const remove = useCallback(() => {
    canvas.remove(canvas.getActiveObject());
  }, [canvas]);

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
        canvas.requestRenderAll();
      };

      const fillBackground = element => {
        if (canvas.getActiveObject().get("type") === "i-text") {
          setBackgroundColorToggled(true);
          setBackgroundColor(element[0].backgroundColor);
        }
      };

      const keyChanges = e => {
        if (
          (canvas.getActiveObject().get("type") === "i-text" &&
            canvas.getActiveObject().selected) ||
          canvas.getActiveObject().get("type") !== "i-text"
        ) {
          switch (e.keyCode) {
            case 46:
              remove();
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
        setActiveObj(selected[0]);
        fillBackground(selected);
        fillColor(selected);
        document.addEventListener("keydown", keyChanges);
      });
      canvas.on("selection:updated", ({ selected }) => {
        setActiveObj(selected[0]);
        fillBackground(selected);
        fillColor(selected);
      });
      canvas.on("selection:cleared", () => {
        setColorToggle(false);
        setBackgroundColorToggled(false);
        setActiveObj(null);
        document.removeEventListener("keydown", keyChanges);
        canvas.renderAll();
      });
    }
  }, [canvas, remove, activeObj]);

  const changeColor = newColor => {
    setColor(newColor);
    canvas.getActiveObject().set({
      fill: newColor
    });
    canvas.renderAll();
  };

  const changeBackgroundColor = newColor => {
    setBackgroundColor(newColor);
    canvas.getActiveObject().set({
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

  const changeFont = size => {
    canvas.getActiveObject().set({
      fontSize: size
    });
    canvas.renderAll();
  };

  const bold = () => {
    canvas.getActiveObject().set({
      fontWeight:
        canvas.getActiveObject()?.fontWeight === "bold" ? "normal" : "bold"
    });
    canvas.renderAll();
  };

  const italic = () => {
    canvas.getActiveObject().set({
      fontStyle:
        canvas.getActiveObject()?.fontStyle === "italic" ? "normal" : "italic"
    });
    canvas.renderAll();
  };

  const underline = () => {
    canvas.getActiveObject().set({
      underline: !canvas.getActiveObject()?.underline
    });
    canvas.renderAll();
  };

  const textAlign = value => {
    canvas.getActiveObject().set({
      textAlign: value
    });
    canvas.renderAll();
  };

  const options = useMemo(() => [16, 18, 20, 22, 24, 26, 28, 30], []);

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

        {colorToggled && activeObj && (
          <label style={{ padding: "5px" }}>
            Color
            <input
              style={{ margin: "10px" }}
              type="color"
              value={color}
              onChange={e => changeColor(e.target.value)}
            />
          </label>
        )}
        {backgroundColorToggled && activeObj && (
          <>
            <hr />
            <label>
              Change background color
              <input
                type="color"
                value={backgroundColor}
                onChange={e => changeBackgroundColor(e.target.value)}
              />
            </label>
            <label>
              font size
              <select
                defaultValue={activeObj.fontSize}
                onChange={e => changeFont(e.target.value)}
              >
                {options.map(item => (
                  <option key={item} value={item}>{`${item} px`}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => bold()}>
              bold
            </button>
            <button type="button" onClick={() => italic()}>
              italic
            </button>
            <button type="button" onClick={() => underline()}>
              underline
            </button>
            <button type="button" onClick={() => textAlign("left")}>
              left
            </button>
            <button type="button" onClick={() => textAlign("center")}>
              center
            </button>
            <button type="button" onClick={() => textAlign("right")}>
              right
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Component;
