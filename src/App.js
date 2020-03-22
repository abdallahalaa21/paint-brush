import React, { useCallback, useState, useMemo } from "react";
import { fabric } from "fabric";
import * as JsPDF from "jspdf";
import Component from "./Component";

const App = () => {
  const [pages, setPages] = useState([]);
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#e7e7e7");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#e7e7e7");
  const [activeObj, setActiveObj] = useState(null);

  const activePage = useMemo(() => pages[0], [pages]);

  const selectedElement = useCallback(element => {
    setActiveObj(element);
    if (element?.fill) setColor(element.fill);
    if (element?.backgroundColor)
      setTextBackgroundColor(element.backgroundColor);
    if (!element?.backgroundColor) setTextBackgroundColor("e7e7e7");
  }, []);

  const addPage = useCallback(page => {
    setPages(prevState => [...prevState, page]);
  }, []);

  const remove = useCallback(() => {
    activePage.remove(activePage.getActiveObject());
  }, [activePage]);

  const keyChanges = e => {
    if (
      (activePage.getActiveObject().get("type") === "i-text" &&
        activePage.getActiveObject().selected) ||
      activePage.getActiveObject().get("type") === "image" ||
      activePage.getActiveObject().get("type") === "rect"
    ) {
      switch (e.keyCode) {
        case 46:
          remove();
          break;
        case 39: // move right
          e.preventDefault();
          activePage.getActiveObject().left += 1;
          activePage.renderAll();
          break;
        case 37: // move left
          e.preventDefault();
          activePage.getActiveObject().left -= 1;
          activePage.renderAll();
          break;
        case 40: // move down
          e.preventDefault();
          activePage.getActiveObject().top += 1;
          activePage.renderAll();
          break;
        case 38: // move up
          e.preventDefault();
          activePage.getActiveObject().top -= 1;
          activePage.renderAll();
          break;
        default:
      }
    }
  };

  const rec = useCallback(() => {
    const rect = new fabric.Rect({
      fill: "#252424",
      width: 100,
      height: 100
    });
    return activePage.add(rect);
  }, [activePage]);

  const text = useCallback(() => {
    const textElement = new fabric.IText("hello", {
      fontSize: "28",
      fill: "#252424"
    });
    return activePage.add(textElement);
  }, [activePage]);

  const addImage = value => {
    const reader = new FileReader();
    reader.onload = f => {
      const data = f.target.result;
      fabric.Image.fromURL(data, img => {
        let oImg;
        if (img.width > img.height && img.width > activePage.width) {
          oImg = img.set().scaleToWidth(activePage.width / 2, false);
        } else if (img.height > img.width && img.height > activePage.height) {
          oImg = img.set().scaleToHeight(activePage.height / 2, false);
        } else if (img.height > activePage.height) {
          oImg = img.set().scaleToHeight(activePage.height / 2, false);
        } else {
          oImg = img.set();
        }
        activePage.add(oImg).renderAll();
      });
    };
    reader.readAsDataURL(value);
  };

  const changeBackgroundColor = value => {
    if (activePage.backgroundImage) {
      activePage.backgroundImage = false;
    }
    setBackgroundColor(value);
    activePage.backgroundColor = value;
    activePage.renderAll();
  };

  const changeBackgroundImage = value => {
    const reader = new FileReader();
    reader.onload = f => {
      const data = f.target.result;
      fabric.Image.fromURL(data, img => {
        const oImg = img.set().scaleToWidth(activePage.width, false);
        activePage.setBackgroundImage(oImg).renderAll();
      });
    };
    reader.readAsDataURL(value);
  };

  const changeColor = newColor => {
    setColor(newColor);
    activeObj.set({
      fill: newColor
    });
    activePage.renderAll();
  };

  const changeTextBackgroundColor = newColor => {
    setTextBackgroundColor(newColor);
    activeObj.set({
      backgroundColor: newColor
    });
    activePage.renderAll();
  };
  const changeFont = size => {
    activeObj.set({
      fontSize: size
    });
    activePage.renderAll();
  };

  const bold = () => {
    activeObj.set({
      fontWeight: activeObj.fontWeight === "bold" ? "normal" : "bold"
    });
    activePage.renderAll();
  };

  const italic = () => {
    activeObj.set({
      fontStyle: activeObj.fontStyle === "italic" ? "normal" : "italic"
    });
    activePage.renderAll();
  };

  const underline = () => {
    activeObj.set({
      underline: !activeObj.underline
    });
    activePage.renderAll();
  };

  const textAlign = value => {
    activeObj.set({
      textAlign: value
    });
    activePage.renderAll();
  };

  const options = useMemo(() => [16, 18, 20, 22, 24, 26, 28, 30], []);

  const savePdf = () => {
    const imgData = activePage.toDataURL("image/jpeg", 1.0);
    const { width } = activePage;
    const { height } = activePage;
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

  const sendFront = () => {
    activeObj.bringForward();
    activePage.renderAll();
  };

  const sendBack = () => {
    activeObj.sendBackwards();
    activePage.renderAll();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: "0 11%"
      }}
    >
      <p>presentation test</p>
      <div>
        <button type="button" onClick={() => rec()}>
          add rectangle
        </button>
        <button type="button" onClick={() => savePdf()}>
          savePdf
        </button>
        <button type="button" onClick={() => text()}>
          add text
        </button>
        <button
          type="button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log(activePage.getObjects());
            activePage.getObjects().map(ele => {
              // eslint-disable-next-line no-console
              console.log(ele);
              // eslint-disable-next-line no-console
              return console.log(activePage.getObjects().indexOf(ele));
            });
          }}
        >
          get directions
        </button>
        <label htmlFor="addImage" style={{ padding: "5px" }}>
          add image
          <input
            style={{ margin: "0 10px " }}
            placeholder=" add image"
            type="file"
            name="addImage"
            onChange={e => addImage(e.target.files[0])}
          />
        </label>
        <hr />
      </div>
      <div>
        <span>background</span>
        <label htmlFor="background color" style={{ padding: "5px" }}>
          background Color
          <input
            style={{ margin: "0 10px " }}
            type="color"
            name="background color"
            value={backgroundColor}
            onChange={e => changeBackgroundColor(e.target.value)}
          />
        </label>
        <label htmlFor="backgroundImage">
          add background image
          <input
            name="backgroundImage"
            style={{ margin: "0 10px " }}
            placeholder=" add image"
            type="file"
            onChange={e => changeBackgroundImage(e.target.files[0])}
          />
        </label>
        <hr />
      </div>
      {activeObj && (
        <>
          <div>
            <button type="button" onClick={() => sendFront()}>
              bring to front
            </button>
            <button type="button" onClick={() => sendBack()}>
              send to back
            </button>
            <button type="button" onClick={() => remove()}>
              Delete
            </button>
            <label htmlFor="fill" style={{ padding: "5px" }}>
              Color
              <input
                style={{ margin: "10px" }}
                name="fill"
                type="color"
                value={color}
                onChange={e => changeColor(e.target.value)}
              />
            </label>
          </div>
          {activePage.getActiveObject().get("type") === "i-text" && (
            <div>
              <label htmlFor="backgroundColor">
                Change background color
                <input
                  name="backgroundColor"
                  type="color"
                  value={textBackgroundColor}
                  onChange={e => changeTextBackgroundColor(e.target.value)}
                />
              </label>
              <label htmlFor="fontSize">
                font size
                <select
                  name="fontSize"
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
            </div>
          )}
        </>
      )}
      <div
        style={{
          boxShadow: "0 1px 3px 1px rgba(0, 0, 0, 0.16)",
          // height: "100vh",
          width: "100%"
        }}
      >
        <Component
          addPage={addPage}
          backgroundColor={backgroundColor}
          selectedElement={selectedElement}
          keyChanges={keyChanges}
          id="1"
        />
      </div>
    </div>
  );
};

export default App;
