import { Router } from "./Router";

const router = new Router(true);
async function test() {
  document.querySelector(".content").innerHTML = global.location.href;
  console.log("call");
}

async function testOnLeave() {
  console.log("leave test");
}

async function testBefore() {
  alert("before test");
}

async function usersLog() {
  document.querySelector(".content").innerHTML = global.location.href;
  console.log("users or user");
}
router.on({
  match: "/test",
  onEnter: test,
  onLeave: testOnLeave,
  beforeEnter: testBefore,
});
router.on({ match: new RegExp("/users?"), onEnter: usersLog });
