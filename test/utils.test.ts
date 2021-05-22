import * as util from "../src/utils.ts";
import { assert } from "https://deno.land/std@0.97.0/testing/asserts.ts";

Deno.test({
  name: "random color generator test",
  fn: () => {
    const randomHexColor = util.randomHexColorGen();
    const randomLength = Math.floor(((Math.random() * 10) + 1));
    const colors = Array(randomLength).fill('').map(() => randomHexColor.next().value);
    const uniqueColors = [...new Set(colors)];
    assert(uniqueColors.length === randomLength, `repeated color generated in ${randomLength} color genration`);
  }
});

Deno.test({
  name: "array chunk test",
  fn: () => {
    const arrLength = Math.floor(((Math.random() * 10) + 1));
    const array = Array(arrLength).fill(0).map(() => (Math.random()));
    const chunkSize = Math.floor(((Math.random() * 10) + 1));
    const chunks = util.chunk(array, chunkSize);
    let count = 0;
    chunks.forEach((val, idx, arr) => {
      if (idx === arr.length - 1) {
        assert(val.length <= chunkSize, "chunk size is incorrect");
      } else {
        assert(val.length === chunkSize, "chunk size is incorrect");
      }
      count = count + val.length;
    });
    assert(count === arrLength, "sum of chunks size does not match array size");
  }
})

Deno.test({
  name: "get weights for path test #1",
  fn: () => {
    const WEIGHTS = [
      {
        path: "/",
        weight: 0.6
      },
      {
        path: "/contributors/.*",
        weight: 0.5
      }
    ];

    const path = "/faqs";
    const weight = util.getWeightOfPath(path, WEIGHTS);
    assert(weight === 1.0, "path weight does not match expected output");
  }
});

Deno.test({
  name: "get weights for path test #2",
  fn: () => {
    const WEIGHTS = [
      {
        path: "/",
        weight: 0.6
      },
      {
        path: "/contributors($|/.*)",
        weight: 0.5
      }
    ];
    const expectedWeight = 0.5
    let path = "/contributors/start-here";
    let weight = util.getWeightOfPath(path, WEIGHTS);
    assert(weight === expectedWeight, `path (${path}) weight (${weight}) does not match expected output (${expectedWeight})`);
    path = "/contributors";
    weight = util.getWeightOfPath(path, WEIGHTS);
    assert(weight === expectedWeight, `path (${path}) weight (${weight}) does not match expected output (${expectedWeight})`);
  }
});

Deno.test({
  name: "gitbook url generation test #1",
  fn: () => {
    const urlObj1 = {
      apiUrl: "https://api.xyz.com",
      version: "v3",
      spaceId: "-zxmiorw-",
      path: "/page1/page2",
      params: {
        query: 'abc'
      }
    }
    const testUrl = util.getGitbookSpaceUrl(urlObj1.apiUrl, urlObj1.version, urlObj1.spaceId, urlObj1.path, new URLSearchParams(urlObj1.params));
    const expectedUrl = "https://api.xyz.com/v3/spaces/-zxmiorw-/page1/page2?query=abc";
    assert(testUrl.toString() === expectedUrl, "generated url does not match expected url");
  }
});

Deno.test({
  name: "gitbook url generation test #2",
  fn: () => {
    const urlObj = {
      apiUrl: "https://api.xyzabc.com/",
      version: "v5",
      spaceId: "-zxmiorw-",
      path: "pageX/pageY",
      params: {
        query: 'abc',
        id: 'testid'
      }
    }
    const testUrl = util.getGitbookSpaceUrl(urlObj.apiUrl, urlObj.version, urlObj.spaceId, urlObj.path, new URLSearchParams(urlObj.params));
    const expectedUrl = "https://api.xyzabc.com/v5/spaces/-zxmiorw-/pageX/pageY?query=abc&id=testid";
    assert(testUrl.toString() === expectedUrl, "generated url does not match expected url");
  }
})