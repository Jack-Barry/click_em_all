import type { EventDispatcher } from "svelte";
import { writable } from "svelte/store";

import { ClickerEvent, ClickerEventType } from "lib/Clicker/ClickerEvent";

type Statuses = Record<string, ClickerEvent<ClickerEventType>[]>;
//

export function buildClickEmAllEventHandler(
  statuses: Statuses,
  dispatch: EventDispatcher<{ statusChange: Statuses }>,
) {
  const clickerErrors = writable<ClickerEvent<ClickerEventType>[]>([]);

  return function (msg: { data: unknown }) {
    const data = msg.data as unknown as ClickerEvent<ClickerEventType>;
    if (data.type === ClickerEventType.error) {
      clickerErrors.update((prev) => [...prev, data]);
      return;
    }

    const targetId = data.detail?.target.id;

    if (targetId) {
      const newStatuses: typeof statuses = {
        ...statuses,
        [targetId]: [...(statuses[targetId] || []), data],
      };
      dispatch("statusChange", newStatuses);
    }
  };
}
