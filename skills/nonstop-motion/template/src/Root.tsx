import { CalculateMetadataFunction, Composition, Folder } from "remotion";
import { NonstopShort } from "./NonstopShort";
import { schedule } from "./lib/timing";
import { Script, scriptSchema } from "./lib/types";
import aiStory from "../scripts/demo-ai-story.json";
import science from "../scripts/demo-science.json";
import finance from "../scripts/demo-finance.json";
import devFriday from "../scripts/demo-dev-friday.json";

const FPS = 30;

/** Duration is never hand-set: it is derived from the script's reading load + tempo. */
const calculateMetadata: CalculateMetadataFunction<Script> = ({ props }) => {
  const parsed = scriptSchema.parse(props);
  return { durationInFrames: schedule(parsed, FPS).total, props: parsed };
};

const common = {
  component: NonstopShort,
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 300,
  schema: scriptSchema,
  calculateMetadata,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main entry — render with: npx remotion render NonstopShort out/video.mp4 --props=scripts/your-script.json */}
      <Composition id="NonstopShort" {...common} defaultProps={aiStory as Script} />
      <Folder name="Examples">
        <Composition id="Demo-AI-Story" {...common} defaultProps={aiStory as Script} />
        <Composition id="Demo-Science" {...common} defaultProps={science as Script} />
        <Composition id="Demo-Finance" {...common} defaultProps={finance as Script} />
        <Composition id="Demo-Dev-Friday" {...common} defaultProps={devFriday as Script} />
      </Folder>
    </>
  );
};
