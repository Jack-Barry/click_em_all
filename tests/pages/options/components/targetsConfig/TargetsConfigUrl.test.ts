import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";

import { appStorage } from "../../../../../src/lib/data/extensionStorage";
import { clickerTargetSequenceSchema } from "../../../../../src/lib/data/schemas";
import TargetsConfigUrl from "../../../../../src/pages/options/components/targetsConfig/TargetsConfigUrl.svelte";
import {
  cancelButton,
  nameInput,
  sequenceSaveButton,
} from "../../../../utils/commonSelectors";
import type { ZodType, ZodTypeAny } from "zod";
import { getExpectedErrorMessages } from "../../../../utils/errorMessages";

describe("Options: TargetsConfigUrl", () => {
  let props: { url: string };

  beforeEach(() => {
    props = { url: "testurl" };
  });

  describe("viewing", () => {
    test("renders URL as text", () => {
      render(TargetsConfigUrl, props);
      expect(screen.getByText(props.url)).toBeVisible();
    });

    test("renders button to edit the URL", async () => {
      render(TargetsConfigUrl, props);
      expect(urlInput()).not.toBeInTheDocument();

      await userEvent.click(urlEditButton());
      expect(urlInput()).toBeVisible();
      expect(urlInput()).toHaveValue(props.url);
    });

    test("renders button to remove the URL", async () => {
      const mockRemoveUrl = vi.fn();
      vi.spyOn(appStorage.targets, "removeUrl").mockImplementation(
        mockRemoveUrl
      );
      render(TargetsConfigUrl, props);

      await userEvent.click(urlRemoveButton());
      expect(mockRemoveUrl).toHaveBeenCalledOnce();
      expect(mockRemoveUrl).toHaveBeenCalledWith(props.url);
    });

    describe("when not adding a new sequence", () => {
      test("renders button to add new sequence to URL", async () => {
        render(TargetsConfigUrl, props);
        expect(screen.queryByText("Sequence")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();

        await userEvent.click(addSequenceButton());
        expect(screen.getByText("Sequence")).toBeVisible();
        expect(nameInput()).toBeVisible();
        expect(cancelButton()).toBeVisible();
      });
    });

    describe("when adding a new sequence", () => {
      const mockAddSequence = vi.fn();
      vi.spyOn(appStorage.targets, "addSequence").mockImplementation(
        mockAddSequence
      );

      test("new sequence is not added when clicking cancel button", async () => {
        render(TargetsConfigUrl, props);
        await userEvent.click(addSequenceButton());

        await userEvent.click(cancelButton() as HTMLElement);
        expect(mockAddSequence).not.toHaveBeenCalled();
        expect(screen.queryByText("Sequence")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();
      });

      test("error is presented when new sequence name is empty", async () => {
        render(TargetsConfigUrl, props);
        await userEvent.click(addSequenceButton());
        expect(sequenceSaveButton()).toBeDisabled();

        const expectedErrorMessages = getExpectedErrorMessages(
          clickerTargetSequenceSchema.omit({ id: true, targets: true }),
          {
            name: "",
          }
        );

        await userEvent.type(nameInput() as HTMLElement, "Name");
        expect(sequenceSaveButton()).toBeEnabled();

        await userEvent.clear(nameInput() as HTMLElement);
        expect(sequenceSaveButton()).toBeDisabled();
        expectedErrorMessages.forEach((msg) => {
          expect(screen.queryByText(msg)).not.toBeInTheDocument();
        });

        // Error message shows once user has left the field empty
        await userEvent.click(sequenceSaveButton());
        expectedErrorMessages.forEach((msg) => {
          expect(screen.getByText(msg)).toBeVisible();
        });
        expect(screen.getByText("Sequence")).toBeVisible();
        expect(nameInput()).toBeVisible();
        expect(cancelButton()).toBeVisible();
      });

      test("new sequence is added when clicking submit button", async () => {
        render(TargetsConfigUrl, props);
        await userEvent.click(addSequenceButton());

        await userEvent.type(nameInput() as HTMLElement, "New Sequence Name");
        expect(sequenceSaveButton()).toBeEnabled();

        await userEvent.click(sequenceSaveButton());
        expect(mockAddSequence).toHaveBeenCalledOnce();
        expect(mockAddSequence).toHaveBeenCalledWith(props.url, {
          name: "New Sequence Name",
          targets: [],
        });
        expect(screen.queryByText("Sequence")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();
      });
    });
  });

  describe("editing", () => {
    const mockMoveUrl = vi.fn();
    vi.spyOn(appStorage.targets, "moveUrl").mockImplementation(mockMoveUrl);

    test("reverts to editMode:false when cancel button is clicked", async () => {
      render(TargetsConfigUrl, props);
      await userEvent.click(urlEditButton());
      expect(urlInput()).toBeVisible();

      await userEvent.click(cancelButton() as HTMLElement);
      expect(mockMoveUrl).not.toHaveBeenCalled();
      expect(urlInput()).not.toBeInTheDocument();
    });

    test("renders error message when saving throws Error", async () => {
      mockMoveUrl.mockRejectedValueOnce(new Error("bad request"));
      render(TargetsConfigUrl, props);
      await userEvent.click(urlEditButton());
      expect(screen.queryByText("bad request")).not.toBeInTheDocument();

      await userEvent.type(urlInput() as HTMLElement, "x"); // make a change
      await userEvent.click(urlSaveButton());
      expect(screen.getByText("bad request")).toBeVisible();
      expect(urlInput()).toBeVisible(); // still in edit mode
    });

    test("moves URL when edited and saved", async () => {
      render(TargetsConfigUrl, props);
      await userEvent.click(urlEditButton());
      const input = urlInput() as HTMLElement;
      await userEvent.clear(input);
      await userEvent.type(input, "newurl");

      await userEvent.click(urlSaveButton());
      expect(mockMoveUrl).toHaveBeenCalledOnce();
      expect(mockMoveUrl).toHaveBeenCalledWith(props.url, "newurl");
      expect(urlInput()).not.toBeInTheDocument();
    });
  });
});

function addSequenceButton() {
  return screen.getByText("Add Sequence to URL");
}

function urlInput() {
  return screen.queryByLabelText("URL");
}

function urlSaveButton() {
  return screen.getByText("Save URL");
}

function urlEditButton() {
  return screen.getByText("Edit URL");
}

function urlRemoveButton() {
  return screen.getByText("Remove URL");
}
