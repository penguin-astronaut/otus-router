interface listenerInput {
  previosPath: string;
  path: string;
  state: Record<string, any>;
}
type listener = (input: listenerInput) => Promise<any> | any;
type pathFunc = (path: string) => boolean;
type match = string | RegExp | pathFunc;

interface Hooks {
  onEnter?: listener[];
  onLeave?: listener[];
  beforeEnter?: listener[];
}

interface Route extends Hooks {
  match: match;
}

interface PathState {
  [key: string]: any;
}

interface IRouter {
  on(route: Route): () => void;
  go(path: string, state: PathState): void;
}
