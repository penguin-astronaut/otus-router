export class Router implements IRouter {
  private hashMode: boolean;

  private prevPath: string;

  private listeners: Map<match, Hooks> = new Map();

  constructor(hashMode = false, selector = "a") {
    this.hashMode = hashMode;
    this.prevPath = this.getPathName();
    document.body.addEventListener("click", (e: Event) => {
      if (!(e.target as HTMLElement).matches(selector)) {
        return;
      }
      e.preventDefault();
      const uri = (e.target as HTMLLinkElement).getAttribute("href");
      this.prevPath = this.getPathName();
      if (this.hashMode) {
        window.location.hash = uri;
      } else {
        window.history.pushState({}, "", uri);
      }
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

  private handleListeners(path: string, state: PathState = {}): void {
    this.listeners.forEach((listeners: Hooks, match: match) => {
      this.handleListener(listeners, match, path, state);
    });
  }

  private async handleListener(
    listeners: Hooks,
    match: match,
    path: string,
    state: PathState = {}
  ) {
    const argsSate = { ...state, ...this.getQueryParams() };
    const args = {
      previosPath: this.prevPath,
      path,
      state: argsSate,
    };
    const { onEnter, onLeave, beforeEnter } = listeners;

    this.checkPath(match, path) &&
      beforeEnter &&
      this.callHook(beforeEnter, args);

    if (this.checkPath(match, path) && onEnter) {
      this.callHook(onEnter, args);
    }
    if (this.checkPath(match, this.prevPath)) {
      onLeave && this.callHook(onLeave, args);
    }
  }

  private callHook(listeners: listener[], args: listenerInput): void {
    listeners?.forEach(async (listener: listener) => {
      await listener(args);
    });
  }

  private getPathName(): string {
    return this.hashMode
      ? window.location.hash.slice(1)
      : window.location.pathname + window.location.search;
  }

  private getQueryParams(): PathState {
    const searchString = /\?(.+)$/.exec(window.location.href);
    if (!searchString) {
      return {};
    }
    return searchString[1]
      .split("&")
      .reduce((state: PathState, param: string): PathState => {
        const [name, value] = param.split("=");
        state[name] = value;
        return state;
      }, {});
  }

  on(route: Route): () => void {
    const { match, ...listeners } = route;
    this.listeners.set(match, listeners);
    this.handleListener(listeners, match, this.getPathName());
    return (): void => {
      this.listeners.delete(match);
    };
  }

  go(path: string, state: PathState = {}): void {
    this.prevPath = this.getPathName();
    if (this.hashMode) {
      window.location.hash = path;
    } else {
      window.history.pushState(state, "", path);
    }
    this.handleListeners(path, state);
  }
}
