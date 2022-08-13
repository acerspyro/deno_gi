import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { GIInfoType }from "./bindings/gobject-introspection/enums.ts";

export function library(name, version) {
  switch (Deno.build.os) {
    case "darwin":
      return `lib${name}.${version}.dylib`;
    case "linux":
      return `lib${name}.so.${version}`;
    case "windows":
      return `lib${name}-${version}.dll`;
  }
}

export const isLittleEndian =
  (new Uint8Array(new Uint16Array([1]).buffer)[0] === 1);

export const encoder = new TextEncoder();

/**
 * @param {string?} text
 * @returns {Uint8Array?}
 */
export function toCString(text) {
  if (text !== undefined) {
    return encoder.encode(text + "\0");
  }

  return null;
}

/**
 * @param {bigint} info
 * @returns {string}
 */
export function getName(info) {
  const namePtr = GIRepository.g_base_info_get_name(info);
  const nameStr = new Deno.UnsafePointerView(namePtr).getCString();

  const type = GIRepository.g_base_info_get_type(info);

  const isCallableInfo =
    (type === GIInfoType.GI_INFO_TYPE_FUNCTION) ||
    (type === GIInfoType.GI_INFO_TYPE_CALLBACK) ||
    (type === GIInfoType.GI_INFO_TYPE_SIGNAL) ||
    (type === GIInfoType.GI_INFO_TYPE_VFUNC);

  if (isCallableInfo) {
    return toCamelCase(nameStr);
  }

  return nameStr;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function toSnakeCase(text) {
  return text.replaceAll(
    /[A-Z]/g,
    (s) => "_" + s.toLowerCase(),
  );
}

/**
 * @param {string} text
 * @returns {string}
 */
export function toCamelCase(text) {
  return text.replaceAll(
    /_[a-z]/g,
    (s) => s.substring(1).toUpperCase(),
  );
}
