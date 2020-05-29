import fs from 'fs-extra';
import nodePath from 'path';

// This pipeline patch allows us to hook into the JSS manifest generation process.
// Specifically, we add a pipeline processor to the `generateMedia` pipeline.
// The processor is intended to run after all other `generateMedia` processors and will
// copy the media items identified in the manifest to the `/public` folder for static export.

// This usage of `resolve` assumes that the manifest generation process is invoked from
// the project root folder and the `./public` folder is relative to the project root folder.
const staticExportAssetFolderPath = nodePath.resolve('./public');

export const config = (pipelines) => {
  // We only want to execute our custom pipeline processor when the app is being statically exported.
  if (process.env.APP_MODE !== 'export') {
    return;
  }

  const pipeline = pipelines.getPipeline('generateMedia');

  pipeline.addProcessor({
    name: 'copyMediaToPublic',
    process: (processorArgs) => {
      if (!processorArgs.media || !Array.isArray(processorArgs.media)) {
        return processorArgs;
      }

      processorArgs.media.forEach((media) => {
        if (!media.src) {
          console.warn(
            `Media object ${JSON.stringify(
              media
            )} did not have an expected 'src' property. Its media item will not be deployed.`
          );
          return;
        }

        const mediaSourcePath = nodePath.isAbsolute(media.src) ? `.${media.src}` : media.src;

        if (fs.existsSync(mediaSourcePath)) {
          if (!fs.statSync(mediaSourcePath).isFile()) {
            console.warn(
              `Source media path referred to in manifest data is not a file: ${mediaSourcePath}`
            );
            return;
          }
          const mediaDestinationPath = nodePath.join(staticExportAssetFolderPath, media.src);
          const mediaDestinationFolder = nodePath.dirname(mediaDestinationPath);
          fs.ensureDirSync(mediaDestinationFolder);
          fs.copySync(mediaSourcePath, mediaDestinationPath);
          console.log(
            `Copied media for static export from: ${mediaSourcePath} to: ${mediaDestinationPath}`
          );
          return { source: mediaSourcePath, destination: mediaDestinationPath, success: true };
        }
      });

      return processorArgs;
    },
  });
};
