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
    this.hashMode = hashMode;
    document.body.addEventListener("click", (e: Event) => {
      if (!(e.target as HTMLElement).matches(selector)) {
        return;
      }
      e.preventDefault();
      const uri = (e.target as HTMLLinkElement).getAttribute("href");
      this.handleListeners(uri);
    });

    if (hashMode) {
      window.addEventListener("hashchange", () => {
        this.handleListeners(this.getPathName());
      });
    } else {
      window.addEventListener("popstate", () => {
        this.handleListeners(this.getPathName());
      });
    }
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
      state: state ?? {},
    };
    const { onEnter, onLeave, beforeEnter } = listeners;

    this.prevPath = this.getPathName();

    this.checkPath(match, path) && beforeEnter && (await beforeEnter(args));

    if (this.hashMode) {
      global.location.hash = path;
    } else {
      global.history.pushState(state, path, path);
    }

    this.checkPath(match, path) && onEnter && (await onEnter(args));

    if (this.checkPath(match, this.prevPath)) {
      onLeave && (await onLeave(args));
    }
  }

  private getPathName(): string {
    return this.hashMode ? global.location.hash : global.location.pathname;
  }

  on(route: Route): () => void {
    const { match, ...listeners } = route;
    this.listeners.set(match, listeners);
    this.handleListener(listeners, match, this.getPathName());

    return (): void => {
      this.listeners.delete(match);
    };
  }

  go(path: string, state: HistoryState = {}): void {
    this.handleListeners(path, state);
  }
}
