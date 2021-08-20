import { Router } from "./Router";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(async () => {
  document.body.innerHTML = `
    <a class='router-link' href='/test1'>Test1</a>
    <a class='router-link' href='/test2'>Test2</a>
    <a class='router-link' href='/test3'>TEst3</a>
    <a class='router-link' href='/mylink?param1=123&param2=abc'>Home</a>
    <a class='router-link' href='/linkme'>Home</a>
    <a href='/test6'>Home</a>
    <div class='content'></div>
  `;

  window.history.pushState({}, "", "/");
});

afterEach(() => {
  document.documentElement.innerHTML = "<head></head><body></body>";
});

function getPathName(hashMode: boolean): string {
  return hashMode
    ? window.location.hash.slice(1).split("?")[0]
    : window.location.pathname;
}

describe.each([true, false])(`Router test hashmode: %s`, (hashMode) => {
  it("test on", async () => {
    const links = document.querySelectorAll("a");
    const router = new Router(hashMode);
    async function stringOnEnter() {
      document.querySelector(".content").innerHTML = "test1 linked";
    }
    const stringOnEnter2 = jest.fn();
    async function regOnEnter() {
      document.querySelector(".content").innerHTML = "test 2 and 3 link linked";
    }
    const funcOnEnter = jest.fn(() => Promise.resolve());
    const stringOnLeave = jest.fn(() => Promise.resolve());
    const stringBeforeEnter = jest.fn(
      (): Promise<void> => new Promise((r) => setTimeout(r, 50))
    );
    router.on({
      match: "/test1",
      onEnter: [stringOnEnter, stringOnEnter2],
      onLeave: [stringOnLeave],
      beforeEnter: [stringBeforeEnter],
    });
    router.on({ match: new RegExp("/test[2-3]"), onEnter: [regOnEnter] });
    router.on({
      match: (path: string): boolean => path.length === 7,
      onEnter: [funcOnEnter],
    });

    links[0].click();

    await sleep(10);
    expect(stringBeforeEnter).toHaveBeenCalled();
    await sleep(41);
    expect(getPathName(hashMode)).toBe("/test1");
    expect(document.querySelector(".content").innerHTML).toBe("test1 linked");
    expect(stringOnLeave).not.toHaveBeenCalled();
    expect(stringOnEnter2).toHaveBeenCalled();

    links[1].click();
    await sleep(10);
    expect(getPathName(hashMode)).toBe("/test2");
    expect(stringBeforeEnter).toHaveBeenCalledTimes(1);
    expect(funcOnEnter).not.toHaveBeenCalled();
    expect(document.querySelector(".content").innerHTML).toBe(
      "test 2 and 3 link linked"
    );

    links[4].click();
    await sleep(10);
    expect(getPathName(hashMode)).toBe("/linkme");
    expect(funcOnEnter).toHaveBeenCalledWith({
      path: "/linkme",
      previosPath: "/test2",
      state: {},
    });
  });

  it("on with selector", async () => {
    const links = document.querySelectorAll("a");
    const router = new Router(hashMode, ".router-link");
    const onEnter = jest.fn(() => Promise.resolve());
    router.on({ match: new RegExp("test\\d+"), onEnter: [onEnter] });

    links[1].click();
    await sleep(10);
    expect(onEnter).toHaveBeenCalledTimes(1);

    links[5].click();
    await sleep(10);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("remove route", async () => {
    const router = new Router(hashMode);
    const links = document.querySelectorAll("a");
    const onEnter = jest.fn(() => Promise.resolve());
    const removeRoute = router.on({
      match: "/test1",
      onEnter: [onEnter],
    });
    links[0].click();
    await sleep(10);
    expect(onEnter).toHaveBeenCalledTimes(1);

    links[0].click();
    await sleep(10);
    expect(onEnter).toHaveBeenCalledTimes(2);

    removeRoute();

    links[0].click();
    await sleep(10);
    expect(onEnter).toHaveBeenCalledTimes(2);
  });

  it("test go", async () => {
    const router = new Router(hashMode);
    const onEnter = jest.fn(() => Promise.resolve());
    router.on({
      match: "/test1",
      onEnter: [onEnter],
    });
    expect(onEnter).toHaveBeenCalledTimes(0);
    router.go("/test1", { test: "test" });
    await sleep(20);
    expect(onEnter).toHaveBeenCalledWith({
      path: "/test1",
      previosPath: hashMode ? "" : "/",
      state: { test: "test" },
    });
    expect(getPathName(hashMode)).toBe("/test1");
  });

  it("test params", async () => {
    const links = document.querySelectorAll("a");
    const router = new Router(hashMode);
    const onEnter = jest.fn(() => Promise.resolve());
    router.on({ match: new RegExp("mylink"), onEnter: [onEnter] });

    links[3].click();
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledWith({
      path: "/mylink?param1=123&param2=abc",
      previosPath: hashMode ? "" : "/",
      state: { param1: "123", param2: "abc" },
    });
  });
});
