export function getProps(req) {
  const props = {};
  // If we have `jssConfig`, assign it to the initial props.
  // While this makes the `jssConfig` available as a prop to the app, it also makes
  // the config available via SSR state that is serialized to the HTML document via `__NEXT_DATA__`.
  // Which is useful for ensuring the config is available to client code and we can
  // use the config to override the generated config values when necessary.
  if (req.jssConfig) {
    props.jssConfig = req.jssConfig;
  }

  // If we have `jssData`, then use it.
  if (req.jssData) {
    props.language = req.jssData.viewBag.language;
    props.dictionary = req.jssData.viewBag.dictionary;
    props.layoutData = req.jssData.route;
  }

  return Promise.resolve(props);
}
