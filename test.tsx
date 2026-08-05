import React from "react";
import { renderToString } from "react-dom/server";

const el = <p node={{ tagName: "ol" }}></p>;
console.log((el as any).props.node.tagName);
