import browser from "webextension-polyfill";

export async function openOptionsPage() {
  await browser.runtime.openOptionsPage();
}

export async function readPreferences() {
  return await browser.storage.local.get("preferences");
}
