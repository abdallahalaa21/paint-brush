/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { fabric } from "fabric";
import * as JsPDF from "jspdf";

const Component = () => {
  const [canvas, setCanvas] = useState(null);
  const [colorToggled, setColorToggle] = useState(false);
  const [color, setColor] = useState("");
  const [activeObj, setActiveObj] = useState(null);
  const [textBackgroundColorToggled, setTextBackgroundColorToggled] = useState(
    false
  );
  const [textBackgroundColor, setTextBackgroundColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#e7e7e7");

  const remove = useCallback(() => {
    canvas.remove(canvas.getActiveObject());
  }, [canvas]);

  useEffect(() => {
    if (!canvas) {
      setCanvas(
        new fabric.Canvas("canvasID", {
          backgroundColor
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
          setTextBackgroundColorToggled(true);
          setTextBackgroundColor(element[0].backgroundColor);
        } else setTextBackgroundColorToggled(false);
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
        setTextBackgroundColorToggled(false);
        setActiveObj(null);
        document.removeEventListener("keydown", keyChanges);
        canvas.renderAll();
      });
    }
  }, [canvas, remove, activeObj, backgroundColor]);

  const changeColor = newColor => {
    setColor(newColor);
    canvas.getActiveObject().set({
      fill: newColor
    });
    canvas.renderAll();
  };

  const changeTextBackgroundColor = newColor => {
    setTextBackgroundColor(newColor);
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

  const addImage = value => {
    const reader = new FileReader();
    reader.readAsDataURL(value);
    reader.onload = f => {
      const data = f.target.result;
      fabric.Image.fromURL(data, img => {
        let oImg;
        if (img.width > img.height && img.width > canvas.width) {
          oImg = img.set().scaleToWidth(canvas.width / 2, false);
        } else if (img.height > img.width && img.height > canvas.height) {
          oImg = img.set().scaleToHeight(canvas.height / 2, false);
        } else if (img.height > canvas.height) {
          oImg = img.set().scaleToHeight(canvas.height / 2, false);
        } else {
          oImg = img.set();
        }
        canvas.add(oImg).renderAll();
      });
    };
  };

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

  const sendFront = () => {
    activeObj.bringForward();
    canvas.renderAll();
  };

  const sendBack = () => {
    activeObj.sendBackwards();
    canvas.renderAll();
  };

  const changeBackgroundColor = value => {
    if (canvas.backgroundImage) {
      canvas.backgroundImage = false;
    }
    setBackgroundColor(value);
    canvas.backgroundColor = value;
    canvas.renderAll();
  };

  const changeBackgroundImage = value => {
    const reader = new FileReader();
    reader.onload = f => {
      const data = f.target.result;
      fabric.Image.fromURL(data, img => {
        const oImg = img.set().scaleToWidth(canvas.width, false);
        canvas.setBackgroundImage(oImg).renderAll();
      });
    };
    reader.readAsDataURL(value);
  };

  const savePdf = () => {
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const { width } = canvas;
    const { height } = canvas;
    let pdf;
    // set the orientation
    if (width > height) {
      pdf = new JsPDF("l", "px", [width, height]);
    } else {
      pdf = new JsPDF("p", "px", [height, width]);
    }
    const widthPdf = pdf.internal.pageSize.getWidth();
    const heightPdf = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, widthPdf, heightPdf);
    pdf.save("download.pdf");
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
        <button type="button" onClick={() => savePdf()}>
          savePdf
        </button>
        <button type="button" onClick={() => rec()}>
          add rectangle
        </button>

        <button type="button" onClick={() => text()}>
          add text
        </button>
        <button
          type="button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log(canvas.getObjects());
          }}
        >
          get directions
        </button>
        <label style={{ padding: "5px" }}>
          add image
          <input
            style={{ margin: "0 10px " }}
            placeholder=" add image"
            type="file"
            onChange={e => addImage(e.target.files[0])}
          />
        </label>
        <hr />
        <label style={{ padding: "5px" }}>
          background Color
          <input
            style={{ margin: "0 10px " }}
            type="color"
            value={backgroundColor}
            onChange={e => changeBackgroundColor(e.target.value)}
          />
        </label>
        <label>
          add background image
          <input
            style={{ margin: "0 10px " }}
            placeholder=" add image"
            type="file"
            onChange={e => changeBackgroundImage(e.target.files[0])}
          />
        </label>
        {colorToggled && activeObj && (
          <>
            <hr />
            <button type="button" onClick={() => remove()}>
              Delete
            </button>
            <label style={{ padding: "5px" }}>
              Color
              <input
                style={{ margin: "10px" }}
                type="color"
                value={color}
                onChange={e => changeColor(e.target.value)}
              />
            </label>
            <button type="button" onClick={() => sendFront()}>
              bring to front
            </button>
            <button type="button" onClick={() => sendBack()}>
              send to back
            </button>
          </>
        )}
        {textBackgroundColorToggled && activeObj && (
          <>
            <hr />
            <label>
              Change background color
              <input
                type="color"
                value={textBackgroundColor}
                onChange={e => changeTextBackgroundColor(e.target.value)}
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
