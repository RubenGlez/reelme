import { registerRoot, Composition } from "remotion";
import React from "react";
import { Reel, calcTotalDuration } from "./Root";
import { Brief } from "./brief";
import briefJson from "./brief.json";

const brief = briefJson as Brief;

registerRoot(() => {
  return React.createElement(React.Fragment, null,
    React.createElement(Composition, {
      id: "Reel",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: Reel as React.FC<any>,
      durationInFrames: calcTotalDuration(brief),
      fps: 30,
      width: 1920,
      height: 1080,
      defaultProps: { brief },
    })
  );
});
