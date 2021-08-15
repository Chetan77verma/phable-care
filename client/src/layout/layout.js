import React from "react";
import { Image } from "semantic-ui-react";
import logo from "../logo.svg";

function Layout({ children }) {
  return (
    <div>
      <div className="layout">
        <Image size="tiny" src={logo} />
      </div>

      {children}
    </div>
  );
}

export default Layout;
