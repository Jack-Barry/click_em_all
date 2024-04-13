import { screen } from "@testing-library/svelte";

export function cancelButton() {
  return screen.queryByText("Cancel");
}

export function nameInput() {
  return screen.queryByLabelText("Name");
}

export function sequenceSaveButton() {
  return screen.getByText("Save Sequence");
}
