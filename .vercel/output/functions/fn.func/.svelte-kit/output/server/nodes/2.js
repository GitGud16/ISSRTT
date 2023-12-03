

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.99de3602.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.54605d54.js","_app/immutable/chunks/preload-helper.a4192956.js"];
export const stylesheets = ["_app/immutable/assets/2.f4a57091.css"];
export const fonts = [];
