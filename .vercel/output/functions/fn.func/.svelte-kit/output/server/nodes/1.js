

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.824f342b.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.54605d54.js","_app/immutable/chunks/singletons.dec08878.js"];
export const stylesheets = [];
export const fonts = [];
