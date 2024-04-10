import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import TargetsConfigUrl from "../../../../../src/pages/options/components/targetsConfig/TargetsConfigUrl.svelte";
import { appStorage } from "../../../../../src/lib/data/extensionStorage";

describe("TargetsConfigUrl", () => {
  describe("when editMode is false", () => {
    test("renders URL as text", () => {
      render(TargetsConfigUrl, { url: "testurl" });
      expect(screen.getByText("testurl")).toBeVisible();
    });

    test("renders button to edit the URL", async () => {
      render(TargetsConfigUrl, { url: "testurl" });
      expect(screen.queryByLabelText("URL")).not.toBeInTheDocument();
      await userEvent.click(screen.getByText("Edit"));
      const urlInput = screen.getByLabelText("URL");
      expect(urlInput).toBeVisible();
      expect(urlInput).toHaveValue("testurl");
    });

    test("renders button to delete the URL", async () => {
      const mockRemoveUrl = vi.fn();
      vi.spyOn(appStorage.targets, "removeUrl").mockImplementation(
        mockRemoveUrl
      );
      render(TargetsConfigUrl, { url: "testurl" });
      await userEvent.click(screen.getByText("Delete"));
      expect(mockRemoveUrl).toHaveBeenCalledOnce();
      expect(mockRemoveUrl).toHaveBeenCalledWith("testurl");
    });

    describe("when addingSequenceToUrl is false", () => {
      test("renders button to add new sequence to URL", async () => {
        render(TargetsConfigUrl, { url: "testurl" });
        expect(screen.queryByText("New Sequence")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();

        await userEvent.click(getAddSequenceButton());

        expect(screen.getByText("New Sequence")).toBeVisible();
        expect(screen.getByLabelText("Name")).toBeVisible();
        expect(screen.getByText("Cancel")).toBeVisible();
      });
    });

    describe("when addingSequenceToUrl is true", () => {
      const mockAddSequence = vi.fn();
      vi.spyOn(appStorage.targets, "addSequence").mockImplementation(
        mockAddSequence
      );

      test("new sequence is not added when clicking cancel button", async () => {
        render(TargetsConfigUrl, { url: "testurl" });
        await userEvent.click(getAddSequenceButton());
        await userEvent.click(screen.getByText("Cancel"));

        expect(mockAddSequence).not.toHaveBeenCalled();
        expect(screen.queryByText("New Sequence")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
      });

      test("error is presented when new sequence name is empty", async () => {
        render(TargetsConfigUrl, { url: "testurl" });
        await userEvent.click(getAddSequenceButton());

        expect(
          screen.queryByText("Name for new sequence is required")
        ).not.toBeInTheDocument();
        await userEvent.click(screen.getByText("Save"));

        expect(mockAddSequence).not.toHaveBeenCalled();
        expect(
          screen.getByText("Name for new sequence is required")
        ).toBeVisible();
        expect(screen.getByText("New Sequence")).toBeVisible();
        expect(screen.getByLabelText("Name")).toBeVisible();
        expect(screen.getByText("Cancel")).toBeVisible();
      });

      test("new sequence is added when clicking submit button", async () => {
        render(TargetsConfigUrl, { url: "testurl" });
        await userEvent.click(getAddSequenceButton());
        await userEvent.type(
          screen.getByLabelText("Name"),
          "New Sequence Name"
        );
        await userEvent.click(screen.getByText("Save"));

        expect(mockAddSequence).toHaveBeenCalledOnce();
        expect(mockAddSequence).toHaveBeenCalledWith("testurl", {
          name: "New Sequence Name",
          targets: [],
        });
        expect(screen.queryByText("New Sequence")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
      });
    });
  });

  describe("when editMode is true", () => {
    const mockMoveUrl = vi.fn();
    vi.spyOn(appStorage.targets, "moveUrl").mockImplementation(mockMoveUrl);

    test("reverts to editMode:false when cancel button is clicked", async () => {
      render(TargetsConfigUrl, { url: "testurl" });
      await userEvent.click(screen.getByText("Edit"));
      expect(screen.getByLabelText("URL")).toBeVisible();
      await userEvent.click(screen.getByText("Cancel"));
      expect(mockMoveUrl).not.toHaveBeenCalled();
      expect(screen.queryByLabelText("URL")).not.toBeInTheDocument();
    });

    test("renders error message when saving throws Error", async () => {
      mockMoveUrl.mockRejectedValueOnce(new Error("bad request"));
      render(TargetsConfigUrl, { url: "testurl" });
      await userEvent.click(screen.getByText("Edit"));
      expect(screen.queryByText("bad request")).not.toBeInTheDocument();
      await userEvent.click(screen.getByText("Save"));
      expect(screen.getByText("bad request")).toBeVisible();
      // editMode still true
      expect(screen.getByLabelText("URL")).toBeVisible();
    });

    test("moves URL when edited and saved", async () => {
      render(TargetsConfigUrl, { url: "testurl" });
      await userEvent.click(screen.getByText("Edit"));
      await userEvent.clear(screen.getByLabelText("URL"));
      await userEvent.type(screen.getByLabelText("URL"), "newurl");
      await userEvent.click(screen.getByText("Save"));

      expect(mockMoveUrl).toHaveBeenCalledOnce();
      expect(mockMoveUrl).toHaveBeenCalledWith("testurl", "newurl");
      expect(screen.queryByLabelText("URL")).not.toBeInTheDocument();
    });
  });
});

function getAddSequenceButton() {
  return screen.getByText("Add Sequence to URL");
}
