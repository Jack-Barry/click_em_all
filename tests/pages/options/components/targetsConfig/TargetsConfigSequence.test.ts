import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { appStorage } from "../../../../../src/lib/data/extensionStorage";
import type { ClickerTargetsConfigTargetSequence } from "../../../../../src/lib/data/types";
import TargetsConfigSequence from "../../../../../src/pages/options/components/targetsConfig/TargetsConfigSequence.svelte";
import {
  cancelButton,
  nameInput,
  sequenceSaveButton,
} from "../../../../utils/commonSelectors";
import { getExpectedErrorMessages } from "../../../../utils/errorMessages";
import {
  ClickerTargetStrategyType,
  clickerTargetSchema,
} from "../../../../../src/lib/Clicker/schemas";

describe("Options: TargetsConfigSequence", () => {
  let props: { url: string; sequence: ClickerTargetsConfigTargetSequence };

  beforeEach(() => {
    props = {
      url: "testurl",
      sequence: {
        id: "test_sequence",
        name: "Test Sequence",
        targets: [],
      },
    };
  });

  describe("viewing", () => {
    test("renders sequence name as text", () => {
      render(TargetsConfigSequence, props);
      expect(screen.getByText(props.sequence.name)).toBeVisible();
    });

    test("renders button to edit the sequence", async () => {
      render(TargetsConfigSequence, props);
      expect(nameInput()).not.toBeInTheDocument();

      await userEvent.click(sequenceEditButton());
      expect(nameInput()).toBeVisible();
      expect(nameInput()).toHaveValue(props.sequence.name);
    });

    test("renders button to remove the sequence", async () => {
      const mockRemoveSequence = vi.fn();
      vi.spyOn(appStorage.targets, "removeSequence").mockImplementation(
        mockRemoveSequence
      );
      render(TargetsConfigSequence, props);

      await userEvent.click(sequenceRemoveButton());
      expect(mockRemoveSequence).toHaveBeenCalledOnce();
      expect(mockRemoveSequence).toHaveBeenCalledWith(
        props.url,
        props.sequence.id
      );
    });

    describe("when not adding a new target", () => {
      test("renders a button to add a new target to sequence", async () => {
        render(TargetsConfigSequence, props);
        expect(screen.queryByText("Target")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();

        await userEvent.click(addTargetButton());
        expect(screen.getByText("Target")).toBeVisible();
        expect(nameInput()).toBeVisible();
        expect(cancelButton()).toBeVisible();
      });
    });

    describe("when adding a new target", () => {
      const mockAddTarget = vi.fn();
      vi.spyOn(appStorage.targets, "addTargetToSequence").mockImplementation(
        mockAddTarget
      );

      test("new target is not added when clicking cancel button", async () => {
        render(TargetsConfigSequence, props);
        await userEvent.click(addTargetButton());

        await userEvent.click(cancelButton() as HTMLElement);
        expect(mockAddTarget).not.toHaveBeenCalled();
        expect(screen.queryByText("Target")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(selectorInput()).not.toBeInTheDocument();
        expect(strategySelector()).not.toBeInTheDocument();
        expect(maxClicksInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();
      });

      test("error is presented when target name is empty", async () => {
        render(TargetsConfigSequence, props);
        await userEvent.click(addTargetButton());
        expect(targetSaveButton()).toBeDisabled();

        const expectedErrorMessages = getExpectedErrorMessages(
          clickerTargetSchema.pick({ name: true }),
          {
            name: "",
          }
        );

        await userEvent.type(nameInput() as HTMLElement, "Name");
        await userEvent.clear(nameInput() as HTMLElement);
        expectedErrorMessages.forEach((msg) => {
          expect(screen.queryByText(msg)).not.toBeInTheDocument();
        });
        expect(targetSaveButton()).toBeDisabled();

        // Error message shows once user has left the field empty
        await userEvent.click(targetSaveButton());
        expectedErrorMessages.forEach((msg) => {
          expect(screen.getByText(msg)).toBeVisible();
        });
        expect(screen.getByText("Target")).toBeVisible();
        expect(nameInput()).toBeVisible();
        expect(selectorInput()).toBeVisible();
        expect(strategySelector()).toBeVisible();
        expect(maxClicksInput()).toBeVisible();
        expect(cancelButton()).toBeVisible();
      });

      test("error is presented when target selector is empty", async () => {
        render(TargetsConfigSequence, props);
        await userEvent.click(addTargetButton());
        expect(targetSaveButton()).toBeDisabled();

        const expectedErrorMessages = getExpectedErrorMessages(
          clickerTargetSchema.pick({ selector: true }),
          {
            selector: "",
          }
        );

        await userEvent.type(selectorInput() as HTMLElement, ".selector");
        await userEvent.clear(selectorInput() as HTMLElement);
        expectedErrorMessages.forEach((msg) => {
          expect(screen.queryByText(msg)).not.toBeInTheDocument();
        });
        expect(targetSaveButton()).toBeDisabled();

        // Error message shows once user has left the field empty
        await userEvent.click(targetSaveButton());
        expectedErrorMessages.forEach((msg) => {
          expect(screen.getByText(msg)).toBeVisible();
        });
        expect(screen.getByText("Target")).toBeVisible();
        expect(nameInput()).toBeVisible();
        expect(selectorInput()).toBeVisible();
        expect(strategySelector()).toBeVisible();
        expect(maxClicksInput()).toBeVisible();
        expect(cancelButton()).toBeVisible();
      });

      test("new target is added when clicking submit button", async () => {
        render(TargetsConfigSequence, props);
        await userEvent.click(addTargetButton());

        await userEvent.type(nameInput() as HTMLElement, "New Target Name");
        await userEvent.type(selectorInput() as HTMLElement, ".selector");
        expect(targetSaveButton()).toBeEnabled();

        await userEvent.click(targetSaveButton());
        expect(mockAddTarget).toHaveBeenCalledOnce();
        expect(mockAddTarget).toHaveBeenCalledWith(
          props.url,
          props.sequence.id,
          {
            name: "New Target Name",
            selector: ".selector",
            strategy: ClickerTargetStrategyType.whilePresent,
            maxClicks: Infinity,
          }
        );
        expect(screen.queryByText("Target")).not.toBeInTheDocument();
        expect(nameInput()).not.toBeInTheDocument();
        expect(selectorInput()).not.toBeInTheDocument();
        expect(strategySelector()).not.toBeInTheDocument();
        expect(maxClicksInput()).not.toBeInTheDocument();
        expect(cancelButton()).not.toBeInTheDocument();
      });
    });
  });

  describe("editing", () => {
    const mockEditSequence = vi.fn();
    vi.spyOn(appStorage.targets, "editSequence").mockImplementation(
      mockEditSequence
    );

    test("reverts to non-edit mode when cancel button is clicked", async () => {
      render(TargetsConfigSequence, props);
      await userEvent.click(sequenceEditButton());
      expect(nameInput()).toBeVisible();

      await userEvent.click(cancelButton() as HTMLElement);
      expect(mockEditSequence).not.toHaveBeenCalled();
      expect(nameInput()).not.toBeInTheDocument();
    });

    test("renders error message when saving throws Error", async () => {
      mockEditSequence.mockRejectedValueOnce(new Error("bad request"));
      render(TargetsConfigSequence, props);
      await userEvent.click(sequenceEditButton());
      expect(screen.queryByText("bad request")).not.toBeInTheDocument();

      await userEvent.type(nameInput() as HTMLElement, "x"); // make a change
      await userEvent.click(sequenceSaveButton());
      expect(screen.getByText("bad request")).toBeVisible();
      expect(nameInput()).toBeVisible(); // still in edit mode
    });

    test("saves updated sequence", async () => {
      render(TargetsConfigSequence, props);
      await userEvent.click(sequenceEditButton());
      const input = nameInput() as HTMLElement;
      await userEvent.clear(input);
      await userEvent.type(input, "New Name");

      await userEvent.click(sequenceSaveButton());
      expect(mockEditSequence).toHaveBeenCalledOnce();
      expect(mockEditSequence).toHaveBeenCalledWith(
        props.url,
        props.sequence.id,
        {
          name: "New Name",
        }
      );
      expect(nameInput()).not.toBeInTheDocument();
    });
  });
});

function sequenceEditButton() {
  return screen.getByText("Edit Sequence");
}

function sequenceRemoveButton() {
  return screen.getByText("Remove Sequence");
}

function addTargetButton() {
  return screen.getByText("Add Target to Sequence");
}

function targetSaveButton() {
  return screen.getByText("Save Target");
}

function selectorInput() {
  return screen.queryByLabelText("Selector");
}

function strategySelector() {
  return screen.queryByLabelText("Strategy");
}

function maxClicksInput() {
  return screen.queryByLabelText("Max Clicks");
}
