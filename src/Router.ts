type listener = (...args: any[]) => Promise<void>;
type pathFunc = (...args: any[]) => void;
type match = string | RegExp | pathFunc;

interface Hooks {
  onEnter?: listener;
  onLeave?: listener;
  beforeEnter?: listener;
}

interface Route extends Hooks {
  match: match;
}

interface HistoryState {
  [key: string]: any;
}

export class Router {
  private hashMode: boolean;

  private prevPath: string;

  private listeners: Map<match, Hooks> = new Map();

  constructor(hashMode = false, selector = "a") {
    document.body.addEventListener("click", (e: Event) => {
      if (!(e.target as HTMLElement).matches(selector)) {
        return;
      }
      e.preventDefault();
      const uri = (e.target as HTMLLinkElement).getAttribute("href");
      this.handleListeners(uri);
    });
  }

  private checkPath(match: match, path: string): boolean {
    return (
      (match instanceof RegExp && match.test(path)) ||
      (typeof match === "function" && match(path)) ||
      (typeof match === "string" && match === path)
    );
  }

  private handleListeners(path: string, state: HistoryState = {}): void {
    this.listeners.forEach((listeners: Hooks, match: match) => {
      this.handleListener(listeners, match, path, state);
    });
  }

  private async handleListener(
    listeners: Hooks,
    match: match,
    path: string,
    state?: HistoryState
  ) {
    const args = {
      previosPath: this.prevPath,
      path,
      state: global.history.state,
    };
    const { onEnter, onLeave, beforeEnter } = listeners;

    this.prevPath = global.location.pathname;

    this.checkPath(match, path) && beforeEnter && (await beforeEnter(args));

    global.history.pushState(state, path, path);
    args.state = state;

    this.checkPath(match, path) && onEnter && onEnter(args);

    if (this.checkPath(match, this.prevPath)) {
      onLeave && onLeave(args);
    }
  }

  on(route: Route) {
    const { match, ...listeners } = route;
    this.listeners.set(match, listeners);
    this.handleListener(listeners, match, global.location.pathname);
  }

  go(path: string, state: HistoryState = {}): void {
    this.handleListeners(path, state);
  }
}
