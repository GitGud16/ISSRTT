import { c as create_ssr_component } from "../../chunks/ssr.js";
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: '@import "../style/global.css";',
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
