import { registerRoot, Composition } from "remotion";
import React from "react";
import { Reel, calcTotalDuration } from "./Root";
import { Brief } from "./brief";
import briefJson from "./brief.json";

const brief = briefJson as Brief;

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "1:1":  { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

const { width, height } = FORMAT_DIMENSIONS[brief.project.format ?? "16:9"] ?? FORMAT_DIMENSIONS["16:9"];

registerRoot(() => {
  return React.createElement(React.Fragment, null,
    React.createElement(Composition, {
      id: "Reel",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: Reel as React.FC<any>,
      durationInFrames: calcTotalDuration(brief),
      fps: 30,
      width,
      height,
      defaultProps: { brief },
    })
  );
});
