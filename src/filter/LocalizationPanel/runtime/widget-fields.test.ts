jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));

import { LocalizationWidgetFields } from "./widget-fields";
import type { LocalizationHost, LocalizationWidgetProps } from "./components/host";
import { createInitialGeoState } from "./components/Shell/initial-state";

class TestFields extends LocalizationWidgetFields {
  readonly state = createInitialGeoState();
  // `host` is abstract in the base (the widget supplies it); mirror the widget.
  protected get host(): LocalizationHost {
    return this as unknown as LocalizationHost;
  }
  render(): null {
    return null;
  }
  exposeHost(): LocalizationHost {
    return this.host;
  }
}

describe("LocalizationWidgetFields", () => {
  test("initializes bookkeeping defaults readable through the host view", () => {
    const fields = new TestFields({} as LocalizationWidgetProps);
    const host = fields.exposeHost();
    expect(host).toBe(fields as unknown as LocalizationHost);
    expect(host._isMounted).toBe(false);
    expect(host._vhMapUniqueIds).toBeNull();
    expect(host._polygonAreaQueryCache.size).toBe(0);
    expect(host._cropRenderedLayers.size).toBe(0);
    expect(host._chartDimOrder).toEqual([]);
    expect(host._lastShownRegionYearLayers).toEqual([]);
    expect(host._graffSearchWrapRef.current).toBeNull();
    expect(host._lastBroadcastDigest).toBe("");
    expect(host.state.connectionStatus).toBe("idle");
  });
});
