import React from "react";
import { Composition } from "remotion";
import { CardiacVideo } from "./Video";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CardiacVideo"
        component={CardiacVideo}
        durationInFrames={1800} // 60 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
