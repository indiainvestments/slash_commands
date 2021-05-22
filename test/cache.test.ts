import { Cache } from "../src/cache/page_desc_cache.ts";
import { GitbookSpaceClient } from "../src/gitbook_client.ts";
import { stub } from "https://deno.land/x/mock@v0.9.5/stub.ts";
import { FakeTime } from "https://deno.land/x/mock@v0.9.5/time.ts";
import { mock1 } from "./__mocks__/gitbook_content_mock.js";
import { Spy, spy } from "https://deno.land/x/mock@v0.9.5/spy.ts";
import { assert } from "https://deno.land/std@0.97.0/testing/asserts.ts";

Deno.test({
  name: "cache should refresh after TTL test",
  fn: async () => {
    const pageId = '-MUEnNPwNxmH8dSZmQfX';
    const expectedDesc1 = "test description to be used in cache test initially";
    const client: GitbookSpaceClient = { get: () => { } } as unknown as GitbookSpaceClient;
    stub(client, "get", () => mock1);
    const time: FakeTime = new FakeTime();
    try {
      const cache = new Cache(client);
      await cache.fillData();
      assert(cache.getValue(pageId), expectedDesc1);
      const refreshCache: Spy<Cache> = spy(cache, "fillData");
      time.tick(70 * 60 * 1000);
      assert(refreshCache.calls.length === 1, "refresh cache should be only called once");
    } catch (err) {
      console.log(err);
    }
  },
  sanitizeOps: false
});