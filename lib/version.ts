import pkg from "../package.json";

/** Versión actual de la aplicación, leída de package.json en build time. */
export const APP_VERSION: string = pkg.version;
