// import { launchBrowser } from "../../src";
import { defaultPuppeteerBrowserOptions } from "../src/pptr-utils/default";
import { fillForms } from "../src/pptr-utils/interaction-utils";
import { Browser, Page } from "puppeteer";
import { setupBlacklightInspector, BlacklightEvent } from "../src/inspector";

let browser = {} as Browser;
const INPUT_VALUES_RESULT = [
  { type: "email", value: "blacklight@themarkup.org", name: "email" },
  {
    type: "text",
    value: "IdaTarbell",
    name: "username"
  },
  { type: "password", value: "SUPERSECRETP@SSW0RD", name: "" },
  {
    type: "text",
    value: "IdaTarbell",
    name: "test"
  },
  { type: "submit", value: "Submit", name: "" }
];

const EVENT_LISTENER_RESULT = new Map()
  .set(
    "KEYBOARD",
    new Set([
      "http://localhost:8125/shared/event-listener.js",
      "https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js"
    ])
  )
  .set(
    "MOUSE",
    new Set([
      "http://localhost:8125/shared/event-listener.js",
      "https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js"
    ])
  )
  .set("SENSOR", new Set(["http://localhost:8125/shared/event-listener.js"]))
  .set(
    "TOUCH",
    new Set([
      "http://localhost:8125/shared/event-listener.js",
      "https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js"
    ])
  );

const DATA_EXFILTRATION = [
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        '{"events":{"type":3,"data":{"source":5,"text":"blacklight@themarkup.orgtest@example.com","isChecked":false,"id":21}}}',
      base_64: false,
      filter: ["blacklight@themarkup.org"]
    }
  },
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        "eyJ0eXBlIjozLCJkYXRhIjp7InNvdXJjZSI6NSwidGV4dCI6ImJsYWNrbGlnaHRAdGhlbWFya3VwLm9yZ3Rlc3RAZXhhbXBsZS5jb20iLCJpc0NoZWNrZWQiOmZhbHNlLCJpZCI6MjF9fQ==",
      base_64: true,
      filter: ["blacklight@themarkup.org"]
    }
  },
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        '{"events":{"type":3,"data":{"source":5,"text":"IdaTarbell","isChecked":false,"id":24}}}',
      base_64: false,
      filter: ["IdaTarbell"]
    }
  },
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        "eyJ0eXBlIjozLCJkYXRhIjp7InNvdXJjZSI6NSwidGV4dCI6IklkYVRhcmJlbGwiLCJpc0NoZWNrZWQiOmZhbHNlLCJpZCI6MjR9fQ==",
      base_64: true,
      filter: ["IdaTarbell"]
    }
  },
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        '{"events":{"type":3,"data":{"source":5,"text":"IdaTarbell","isChecked":false,"id":27}}}',
      base_64: false,
      filter: ["IdaTarbell"]
    }
  },
  {
    type: "DataExfiltration",
    url: "http://localhost:8125/session_recorder.html",
    stack: [
      {
        fileName: "http://localhost:8125/session_recorder.html",
        source: "RequestHandler"
      }
    ],
    data: {
      post_request_url: "http://localhost:8125/bogus_submit.html",
      post_data:
        "eyJ0eXBlIjozLCJkYXRhIjp7InNvdXJjZSI6NSwidGV4dCI6IklkYVRhcmJlbGwiLCJpc0NoZWNrZWQiOmZhbHNlLCJpZCI6Mjd9fQ==",
      base_64: true,
      filter: ["IdaTarbell"]
    }
  }
];
beforeAll(async () => {
  browser = await launch({
    ...defaultPuppeteerBrowserOptions,
    headless: true
  });
});

afterAll(async () => {
  await browser.close();
});
describe("DataExfiltration", () => {
  it("can fill input fields", async () => {
    const page = await browser.newPage();
    const testUrl = `${global.__DEV_SERVER__}/post_request.html`;
    await page.goto(testUrl);
    await fillForms(page);
    const inputValues: any = await page.evaluate(async () => {
      return new Promise((res, rej) => {
        function getInputs() {
          return Array.from(document.getElementsByTagName("input")).map(el => ({
            type: el.type || "",
            value: el.value || "",
            name: el.name || ""
          }));
        }
        res(getInputs());
      });
    });
    expect(inputValues.sort()).toEqual(INPUT_VALUES_RESULT.sort());
    await page.close();
  });
  it("can observe which scripts are monitoring behaviour events", async () => {
    const page = await browser.newPage();
    const testUrl = `${global.__DEV_SERVER__}/session_recorder.html`;

    const rows = [];
    const eventHandler = (event: BlacklightEvent) => {
      rows.push(event);
    };
    await setupBlacklightInspector(page, eventHandler, true);
    await page.goto(testUrl, { waitUntil: "networkidle2" });
    const result = rows
      .filter(r => r.type === "AddEventListener")
      .reduce((acc, cur) => {
        if (acc.has(cur.data.event_group)) {
          acc.get(cur.data.event_group).add(cur.stack[0].fileName);
        } else {
          acc.set(cur.data.event_group, new Set([cur.stack[0].fileName]));
        }

        return acc;
      }, new Map());

    expect(result).toEqual(EVENT_LISTENER_RESULT);
    await page.close();
  });
  it("can observe network requests and check for data that matches input that was typed on the page ", async () => {
    const page = await browser.newPage();
    const testUrl = `${global.__DEV_SERVER__}/session_recorder.html`;
    // const testUrl = "https://www.veteransunited.com/";
    const rows = [];
    const eventHandler = event => {
      rows.push(event);
    };
    await setupBlacklightInspector(page, eventHandler, true);
    await page.goto(testUrl, { waitUntil: "networkidle2" });
    await page.waitFor(1000);
    await fillForms(page);
    await page.waitFor(100);
    await page.close();
    console.log(rows.filter(r => r.type === "DataExfiltration").sort());
    expect(rows.filter(r => r.type === "DataExfiltration").sort()).toEqual(
      DATA_EXFILTRATION.sort()
    );
  });
});