/* eslint-disable react/prop-types */
import React from "react";

const CanvasContext = React.createContext();
const CanvasProvider = ({ id, children, canvas }) => (
  <CanvasContext.Provider value={{ canvas, id }}>
    {children}
  </CanvasContext.Provider>
);

export { CanvasContext };
export default CanvasProvider;

// import React, { Component } from "react";

// const CanvasContext = React.createContext();
// class CanvasProvider extends Component {
//   render() {
//     const { id, children, canvas } = this.props;
//     console.log("inside class", { canvas });
//     return (
//       <CanvasContext.Provider value={{ canvas, id }}>
//         {children}
//       </CanvasContext.Provider>
//     );
//   }
// }

// export { CanvasContext };
// export default CanvasProvider;
