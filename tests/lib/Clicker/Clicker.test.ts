import { Clicker, type ClickerTarget } from "../../../src/lib/Clicker/Clicker";
import {
  ClickerEvent,
  ClickerEventType,
} from "../../../src/lib/Clicker/ClickerEvent";
import { ClickerTargetStrategyType } from "../../../src/lib/Clicker/schemas";

describe("Clicker", () => {
  let clicker: Clicker;
  let whilePresentTarget: ClickerTarget;
  let allFoundTarget: ClickerTarget;

  const handleError = vi.fn();
  const handleBeginClickingEvent = vi.fn();
  const handleFoundElementsEvent = vi.fn();
  const handleMaxClicksReachedEvent = vi.fn();
  const handleClickedElementsEvent = vi.fn();
  const handleEndClickingEvent = vi.fn();

  beforeEach(() => {
    clicker = new Clicker();
    clicker.addEventListener(ClickerEventType.error, handleError);
    clicker.addEventListener(
      ClickerEventType.beginClicking,
      handleBeginClickingEvent
    );
    clicker.addEventListener(
      ClickerEventType.foundElements,
      handleFoundElementsEvent
    );
    clicker.addEventListener(
      ClickerEventType.maxClicksReached,
      handleMaxClicksReachedEvent
    );
    clicker.addEventListener(
      ClickerEventType.clickedElements,
      handleClickedElementsEvent
    );
    clicker.addEventListener(
      ClickerEventType.endClicking,
      handleEndClickingEvent
    );

    whilePresentTarget = {
      name: "While present target",
      selector: ".whilePresentSelector",
      strategy: ClickerTargetStrategyType.whilePresent,
    };
    allFoundTarget = {
      name: "All Found Target",
      selector: ".allFoundTarget",
      strategy: ClickerTargetStrategyType.allFound,
    };
  });

  test("emits error events for callers to listen for", async () => {
    const error = new Error("bad request");
    vi.spyOn(document, "querySelector").mockImplementationOnce(() => {
      throw error;
    });
    await expect(clicker.clickEmAll([whilePresentTarget])).rejects.toEqual(
      error
    );
    expect(handleError).toHaveBeenCalledOnce();
    expect(handleError).toHaveBeenCalledWith(expect.any(ClickerEvent));
    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: error,
      })
    );
  });

  describe("when handling target with strategy: whilePresent", () => {
    const click = vi.fn();

    beforeEach(() => {
      vi.spyOn(document, "querySelector")
        .mockReturnValue(null)
        // @ts-ignore -- just need click function for test
        .mockReturnValueOnce({ click })
        // @ts-ignore
        .mockReturnValueOnce({ click });
    });

    test("clicks first matching element until it is no longer returned", () => {
      clicker.clickEmAll([whilePresentTarget]);

      expect(handleBeginClickingEvent).toHaveBeenCalledOnce();

      expect(handleMaxClicksReachedEvent).not.toHaveBeenCalled();

      expect(handleClickedElementsEvent).toHaveBeenCalledOnce();
      const clickedElementsEventDetail =
        handleClickedElementsEvent.mock.lastCall[0].detail;
      expect(clickedElementsEventDetail.count).toBe(2);
      expect(clickedElementsEventDetail.target).toEqual({
        ...whilePresentTarget,
        id: expect.any(String),
      });

      expect(handleEndClickingEvent).toHaveBeenCalledOnce();
    });

    test("accounts for maxClicks", () => {
      whilePresentTarget.maxClicks = 1;
      clicker.clickEmAll([whilePresentTarget]);

      expect(handleBeginClickingEvent).toHaveBeenCalledOnce();

      expect(handleMaxClicksReachedEvent).toHaveBeenCalledOnce();
      const maxClicksReachedEventDetail =
        handleMaxClicksReachedEvent.mock.lastCall[0].detail;
      expect(maxClicksReachedEventDetail.target).toEqual({
        ...whilePresentTarget,
        id: expect.any(String),
      });

      expect(handleClickedElementsEvent).toHaveBeenCalledOnce();
      const clickedElementsEventDetail =
        handleClickedElementsEvent.mock.lastCall[0].detail;
      expect(clickedElementsEventDetail.count).toBe(1);
      expect(clickedElementsEventDetail.target).toEqual({
        ...whilePresentTarget,
        id: expect.any(String),
      });

      expect(handleEndClickingEvent).toHaveBeenCalledOnce();

      expect(click).toHaveBeenCalledTimes(1);
    });
  });

  describe("when handling target with strategy: allFound", () => {
    const click1 = vi.fn();
    const click2 = vi.fn();
    const element1 = { click: click1 } as unknown as HTMLElement;
    const element2 = { click: click2 } as unknown as HTMLElement;

    beforeEach(() => {
      vi.spyOn(document, "querySelectorAll").mockReturnValueOnce([
        element1,
        element2,
      ] as unknown as NodeListOf<HTMLElement>);
    });

    test("clicks all matching elements", () => {
      clicker.clickEmAll([allFoundTarget]);

      expect(handleBeginClickingEvent).toHaveBeenCalledOnce();

      expect(handleFoundElementsEvent).toHaveBeenCalledOnce();
      const foundElementsEventDetail =
        handleFoundElementsEvent.mock.lastCall[0].detail;
      expect(foundElementsEventDetail.count).toBe(2);
      expect(foundElementsEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });

      expect(handleMaxClicksReachedEvent).not.toHaveBeenCalled();

      expect(handleClickedElementsEvent).toHaveBeenCalledOnce();
      const clickedElementsEventDetail =
        handleClickedElementsEvent.mock.lastCall[0].detail;
      expect(clickedElementsEventDetail.count).toBe(2);
      expect(clickedElementsEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });

      expect(handleEndClickingEvent).toHaveBeenCalledOnce();

      expect(click1).toHaveBeenCalledOnce();
      expect(click2).toHaveBeenCalledOnce();
    });

    test("accounts for maxClicks", () => {
      allFoundTarget.maxClicks = 1;
      clicker.clickEmAll([allFoundTarget]);

      expect(handleBeginClickingEvent).toHaveBeenCalledOnce();

      expect(handleFoundElementsEvent).toHaveBeenCalledOnce();
      const foundElementsEventDetail =
        handleFoundElementsEvent.mock.lastCall[0].detail;
      expect(foundElementsEventDetail.count).toBe(2);
      expect(foundElementsEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });

      expect(handleMaxClicksReachedEvent).toHaveBeenCalledOnce();
      const maxClicksReachedEventDetail =
        handleMaxClicksReachedEvent.mock.lastCall[0].detail;
      expect(maxClicksReachedEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });

      expect(handleClickedElementsEvent).toHaveBeenCalledOnce();
      const clickedElementsEventDetail =
        handleClickedElementsEvent.mock.lastCall[0].detail;
      expect(clickedElementsEventDetail.count).toBe(1);
      expect(clickedElementsEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });

      expect(handleEndClickingEvent).toHaveBeenCalledOnce();

      expect(click1).toHaveBeenCalledOnce();
      expect(click2).not.toHaveBeenCalled();
    });
  });

  describe("when handling targets with different strategies", () => {
    test("clicks each targeted element according to config", () => {
      const whilePresentClick = vi.fn();
      const whilePresentElement = {
        click: whilePresentClick,
      } as unknown as HTMLElement;

      const allFoundClick1 = vi.fn();
      const allFoundElement1 = {
        click: allFoundClick1,
      } as unknown as HTMLElement;

      const allFoundClick2 = vi.fn();
      const allFoundElement2 = {
        click: allFoundClick2,
      } as unknown as HTMLElement;

      vi.spyOn(document, "querySelector").mockReturnValueOnce(
        whilePresentElement
      );
      vi.spyOn(document, "querySelectorAll").mockReturnValueOnce([
        allFoundElement1,
        allFoundElement2,
      ] as unknown as NodeListOf<HTMLElement>);

      clicker.clickEmAll([whilePresentTarget, allFoundTarget]);

      expect(handleBeginClickingEvent).toHaveBeenCalledOnce();

      expect(handleFoundElementsEvent).toHaveBeenCalledOnce();
      const foundElementsEventDetail =
        handleFoundElementsEvent.mock.lastCall[0].detail;
      expect(foundElementsEventDetail.count).toBe(2);
      expect(foundElementsEventDetail.target).toEqual({
        ...allFoundTarget,
        id: expect.any(String),
      });
      const allFoundTargetId = foundElementsEventDetail.target.id;

      expect(handleClickedElementsEvent).toHaveBeenCalledTimes(2);
      const clickedElementsEventDetailWhilePresent =
        handleClickedElementsEvent.mock.calls[0][0].detail;
      expect(clickedElementsEventDetailWhilePresent.count).toBe(1);
      expect(clickedElementsEventDetailWhilePresent.target).toEqual({
        ...whilePresentTarget,
        id: expect.any(String),
      });
      // ID for each target should be unique
      expect(clickedElementsEventDetailWhilePresent.target.id).not.toEqual(
        allFoundTargetId
      );

      const clickedElementsEventDetailAllFound =
        handleClickedElementsEvent.mock.calls[1][0].detail;
      expect(clickedElementsEventDetailAllFound.count).toBe(2);
      expect(clickedElementsEventDetailAllFound.target).toEqual({
        ...allFoundTarget,
        id: allFoundTargetId,
      });

      expect(handleEndClickingEvent).toHaveBeenCalledOnce();

      expect(whilePresentClick).toHaveBeenCalledOnce();
      expect(allFoundClick1).toHaveBeenCalledOnce();
      expect(allFoundClick2).toHaveBeenCalledOnce();
    });
  });
});
