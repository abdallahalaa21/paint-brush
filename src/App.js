import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect
} from "react";
import { fabric } from "fabric";
import { v4 as uuid } from "uuid";
import * as JsPDF from "jspdf";
import Component from "./Component";

const App = () => {
  const [pages, setPages] = useState([]);
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#e7e7e7");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#e7e7e7");
  const [activeObj, setActiveObj] = useState(null);
  const [activePage, setActivePage] = useState(pages[0]);
  const [inputList, setInputList] = useState([]);

  const selectedElement = useCallback(element => {
    if (!element) {
      setActiveObj(null);
      setColor("#000000");
      setTextBackgroundColor("e7e7e7");
    }
    setActiveObj(element);
    if (element?.fill) setColor(element.fill);
    if (element?.backgroundColor)
      setTextBackgroundColor(element.backgroundColor);
    if (!element?.backgroundColor) setTextBackgroundColor("e7e7e7");
  }, []);

  const deletePage = useCallback(
    id => {
      if (inputList.length > 1) {
        setPages(prev => prev.filter(page => page.id !== id));
        setInputList(prev => prev.filter(page => page.id !== id));
        selectedElement(null);
        activePage.discardActiveObject();
        activePage.renderAll();
      }
    },
    [activePage, inputList, selectedElement]
  );

  const selectedPage = useCallback(
    e => {
      const currentPage = Math.floor(
        e.target.scrollTop / e.target.clientHeight
      );
      setActivePage(prev => {
        if (prev !== pages[currentPage]) {
          selectedElement(null);
          activePage.discardActiveObject();
          activePage.renderAll();
          return pages[currentPage];
        }
        return pages[currentPage];
      });
    },
    [pages, setActivePage, selectedElement, activePage]
  );

  useEffect(() => {
    if (!activePage) {
      setActivePage(pages[0]);
    }
  }, [activePage, pages]);

  useEffect(() => {
    document
      .getElementById("pagesContainer")
      .addEventListener("scroll", selectedPage);
    return () => {
      document
        .getElementById("pagesContainer")
        .removeEventListener("scroll", selectedPage);
    };
  }, [selectedPage]);

  const addPage = useCallback(page => {
    setPages(prevState => [...prevState, page]);
  }, []);

  const remove = useCallback(canvas => {
    canvas.remove(canvas.getActiveObject());
  }, []);

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

  const sendFront = () => {
    activeObj.bringForward();
    activePage.renderAll();
  };

  const sendBack = () => {
    activeObj.sendBackwards();
    activePage.renderAll();
  };

  const addNewPage = () => {
    setInputList(prev => [...prev, { Canvas: Component, id: uuid() }]);
  };

  useLayoutEffect(() => addNewPage(), []);

  const resetZoom = page => {
    const zoomRatio = page.getZoom();
    page.setZoom(1);
    page.setWidth(page.width / zoomRatio);
    page.setHeight(page.height / zoomRatio);
    page.renderAll();
  };

  const zoomFunc = e => {
    pages.forEach(page => {
      resetZoom(page);
      const zoom = parseFloat(e.target.value, 10);
      page.setZoom(zoom);
      page.setWidth(page.width * zoom);
      page.setHeight(page.height * zoom);
    });
  };

  const savePdf = () => {
    resetZoom(activePage);
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
    pages.forEach((page, index) => {
      resetZoom(page);
      const imgData = page.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData, "JPEG", 0, 0, widthPdf, heightPdf);
      if (pages.length - index > 1) {
        pdf.addPage();
      }
    });
    pdf.save("download.pdf");
  };

  const saveContent = () => {
    pages.map(page => {
      const { id, backgroundColor, width, height } = page;
      const pageInfo = { id, backgroundColor, width, height };
      pageInfo.objects = [];
      page.getObjects().map(ele => {
        if (ele.get("type") === "i-text") {
          const {
            text,
            fontSize,
            fill,
            backgroundColor,
            width,
            height,
            left,
            top,
            scaleX,
            scaleY,
            angle,
            fontWeight,
            fontStyle,
            underline,
            textAlign
          } = ele;
          const object = {
            text,
            fontSize,
            fill,
            backgroundColor,
            width,
            height,
            left,
            top,
            scaleX,
            scaleY,
            angle,
            fontWeight,
            fontStyle,
            underline,
            textAlign,
            type: ele.get("type")
          };
          pageInfo.objects.push(object);
        }
        // eslint-disable-next-line no-console
        // console.log(ele);
        // eslint-disable-next-line no-console
        // return console.log(activePage.getObjects().indexOf(ele));
      });

      return console.log(pageInfo);
    });
    // eslint-disable-next-line no-console
    // console.log("pages", pages);
    // eslint-disable-next-line no-console
    // console.log(activePage);
    // eslint-disable-next-line no-console
    // console.log(activePage.getObjects());
    // activePage.getObjects().map(ele => {
    //   // eslint-disable-next-line no-console
    //   console.log(ele);
    //   // eslint-disable-next-line no-console
    //   return console.log(activePage.getObjects().indexOf(ele));
    // });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: "0 60px"
      }}
    >
      <p>presentation test</p>
      <div>
        <button type="button" onClick={addNewPage}>
          Add new page
        </button>
        <label htmlFor="zoom">
          zoom
          <select name="zoom" defaultValue={1} onChange={e => zoomFunc(e)}>
            <option value={2}>200%</option>
            <option value={1.75}>175%</option>
            <option value={1.5}>150%</option>
            <option value={1.25}>125%</option>
            <option value={1}>100%</option>
            <option value={0.75}>75%</option>
            <option value={0.5}>50%</option>
            <option value={0.25}>25%</option>
          </select>
        </label>
      </div>
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
        <button type="button" onClick={() => saveContent()}>
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
            <button type="button" onClick={() => remove(activePage)}>
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
          height: "400px",
          width: "100%",
          overflow: "scroll"
        }}
        id="pagesContainer"
      >
        {inputList.map(({ Canvas, id }) => (
          <Canvas
            key={id}
            remove={remove}
            addPage={addPage}
            backgroundColor={backgroundColor}
            selectedElement={selectedElement}
            id={id}
            setActivePage={setActivePage}
            activePage={activePage}
            deletePage={deletePage}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
