import { Router } from "./Router";

const router = new Router(true);
async function test(data: any) {
  document.querySelector(".content").innerHTML = global.location.href;
  console.log("call");
  console.log(data);
}

async function testOnLeave() {
  console.log("leave test");
}

async function testBefore() {
  alert("before test");
}

async function usersLog(data: any) {
  console.log(data);
}
router.on({
  match: "/test",
  onEnter: [test],
  onLeave: [testOnLeave],
  beforeEnter: [testBefore],
});
router.on({ match: new RegExp("/user.?"), onEnter: [usersLog] });
