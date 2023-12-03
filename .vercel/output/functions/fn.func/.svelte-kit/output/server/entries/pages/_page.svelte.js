import { c as create_ssr_component, d as add_attribute, e as escape, v as validate_component } from "../../chunks/ssr.js";
const issInfoApiComponent_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "@import 'leaflet/dist/leaflet.css';",
  map: null
};
let speed2 = 0;
const Iss_info_api_component = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let longitude1 = 0;
  let latitude1 = 0;
  let speed = 0;
  let sliderValue = 50;
  $$result.css.add(css$1);
  return `<div id="map" style="height: 500px;"></div> <div class="slider-container"><input class="slider" type="range" min="0" max="100"${add_attribute("value", sliderValue, 0)}> <button class="button" data-svelte-h="svelte-fomk9w">reset</button></div> <div>speed: ${escape(speed)}m/s
        long: ${escape(longitude1)}
        lat: ${escape(latitude1)} ${escape(speed2)}</div> `;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: '@import "../style/main-page-styling.css";',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${validate_component(Iss_info_api_component, "IssInfoApiComponent").$$render($$result, {}, {}, {})} <div class="container" data-svelte-h="svelte-1dn0h87"><h1 class="typing-animation">Welcome to the International Space Station real time Tracker (ISSRTT).</h1> </div>`;
});
export {
  Page as default
};
