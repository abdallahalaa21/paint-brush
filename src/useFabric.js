import { useRef, useCallback } from "react";
import { fabric } from "fabric";

const useFabric = onChange => {
  const fabricRef = useRef();
  const disposeRef = useRef();
  const canvas = useCallback(node => {
    if (node) {
      fabricRef.current = new fabric.Canvas(node, {
        backgroundColor: "#e7e7e7"
      });
      fabricRef.current.hoverCursor = "pointer";
      fabricRef.current.selection = false; // disable group selection
      // fabricRef.current.on("selection:created", ({ selected }) => {
      // console.log(selected);
      // setColor(selected[0].fill);
      // setColorToggle(true);
      // setActiveObj(canvas.getActiveObject());
      // });
      // fabricRef.current.on("selection:cleared", () => {
      // setColor("");
      // setColorToggle(false);
      // setActiveObj("");
      // });
      if (onChange) {
        disposeRef.current = onChange(fabricRef.current);
      }
    } else if (fabricRef.current) {
      fabricRef.current.dispose();
      if (disposeRef.current) {
        disposeRef.current();
        disposeRef.current = undefined;
      }
    }
  }, []);
  return canvas;
};

export default useFabric;
