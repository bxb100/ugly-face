import { Action, ActionPanel, Detail, environment, Icon, showToast, Toast } from "@raycast/api";
import { Svg } from "./components/Svg";
import { renderToString } from "react-dom/server";
import { useEffect, useState } from "react";
import * as fs from "node:fs";
import { homedir } from "os";
import { showFailureToast } from "@raycast/utils";
import { initWasm, Resvg } from "../lib/resvg";
import path from "node:path";

const DOWNLOADS_DIR = `${homedir()}/Downloads`;

export default function Command() {
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(true);

  const generate = () => {
    setLoading(true);
    const svg = renderToString(<Svg />);
    const markdownImg = `![SVG](data:image/svg+xml;base64,${btoa(svg)}?raycast-height=350)`;
    fs.writeFileSync(environment.supportPath + "/icon.svg", svg);
    setImg(markdownImg);
    setLoading(false);
  };

  const download = async () => {
    try {
      await showToast(Toast.Style.Animated, "Downloading image", "Please wait...");
      const data = fs.readFileSync(environment.supportPath + "/icon.svg");
      fs.writeFileSync(DOWNLOADS_DIR + "/face.svg", data);
      await showToast(Toast.Style.Success, "Image Downloaded!", DOWNLOADS_DIR);
    } catch (error) {
      await showFailureToast(error, { title: "Failed to download image" });
    }
  };

  const downloadPng = async () => {
    try {
      await initWasm(fs.readFileSync(path.join(environment.assetsPath, "index_bg.wasm")));
      await showToast(Toast.Style.Animated, "Downloading image", "Please wait...");
      const data = fs.readFileSync(environment.supportPath + "/icon.svg");
      const resvg = new Resvg(data);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      fs.writeFileSync(DOWNLOADS_DIR + "/face.png", pngBuffer);
      await showToast(Toast.Style.Success, "Image Downloaded!", DOWNLOADS_DIR);
    } catch (error) {
      await showFailureToast(error, { title: "Failed to download image" });
    }
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <Detail
      isLoading={loading}
      markdown={img}
      actions={
        <ActionPanel>
          <Action title={"Regenerate"} icon={Icon.Repeat} onAction={generate} />
          <Action title={"Download PNG"} icon={Icon.Download} onAction={downloadPng} />
          <Action
            title={"Download SVG"}
            icon={Icon.Download}
            onAction={download}
            shortcut={{
              modifiers: ["cmd"],
              key: "d",
            }}
          />
        </ActionPanel>
      }
    />
  );
}
