import Hero from "./components/Hero/Hero";
import LinkList from "./components/LinkList/LinkList";

const components = new Map();
components.set("Hero", Hero);
components.set("LinkList", LinkList);

export default function componentFactory(componentName) {
  return components.get(componentName);
}
