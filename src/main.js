import { generate_graph, reset_graph_view, highlight_node } from "./graph.js";
import { DIRECTIONS, DOWN, LEFT, RIGHT, UP } from "./constants.js";
import { restricted_sliding_blocks_model } from "./simulator/restricted_sliding_blocks/model.js";
import { sliding_blocks_model } from "./simulator/sliding_blocks/model.js";
import { get_viewport_dims } from "./viewport.js";

//
// Application state
//

let current_model = 0;
let models = [restricted_sliding_blocks_model, sliding_blocks_model];
let model = models[current_model];

let current_initial_state = 0;
let initial_state = model.initial_states[current_initial_state];

let current_state = initial_state;
let selected_element = null;

let states = null;
let data = null;
let graph = null;

//
// Helpers
//

export const prepare = (state) => {
  let _state = structuredClone(state);

  for (let i = 0; i < state.board.length; i++) {
    // Remove IDs
    _state.board[i].splice(0, 1);
  }
  // Sort, so we can compare keys
  _state.board.sort();

  return _state;
};

// Disable "prepare" to compare IDs aswell (explodes the state space though)
export const key_of = (state) => JSON.stringify(prepare(state).board);

const clear_states = () => {
  states = {
    _map: new Map(),

    add(state) {
      const key = key_of(state);
      if (!this._map.has(key)) {
        this._map.set(key, state);
      }
      return this;
    },

    has(state) {
      return this._map.has(key_of(state));
    },

    get(key) {
      return this._map.get(key);
    },

    delete(state) {
      return this._map.delete(key_of(state));
    },

    values() {
      return [...this._map.values()];
    },

    get length() {
      return this._map.size;
    },
  };
};

const clear_graph = () => {
  document.getElementById("graph").innerHTML = "";
  clear_visualization();
  model.visualize(initial_state);
  clear_states();
  states.add(initial_state);
  current_state = initial_state;
  data = {
    nodes: [{ id: key_of(current_state) }],
    links: [],
  };
  graph = null;
  graph = generate_graph(data, node_click_view_state);
  highlight_node(states, graph, current_state);
};

const clear_visualization = () => {
  const canvas = document.getElementById("model_canvas");
  const context = canvas.getContext("2d");

  const [vw, vh] = get_viewport_dims();
  canvas.width = vw / 2 - 9.5;
  canvas.height = vh - 43;

  context.clearRect(0, 0, canvas.width, canvas.height);
};

//
// Set up the page when loaded
//

window.onload = () => {
  document.getElementById("model_name").innerHTML = model.name;
  document.getElementById("state_name").innerHTML = initial_state.name;
  clear_visualization();
  model.visualize(initial_state);
  clear_states();
  states.add(initial_state);
  data = {
    nodes: [{ id: key_of(initial_state) }],
    links: [],
  };
  graph = generate_graph(data, node_click_view_state);
  highlight_node(states, graph, current_state);
};

//
// Node click handlers
//

const node_click_view_state = (node, graph) => {
  clear_visualization();
  current_state = states.get(node.id);

  model.visualize(current_state);
  highlight_node(states, graph, current_state);
};

//
// Set up model event-handlers
//

document.getElementById("model_canvas").addEventListener("click", (event) => {
  const element = model.select(current_state, event.offsetX, event.offsetY);

  if (element !== null) {
    clear_visualization();
    selected_element = element;

    model.visualize(current_state);
    model.highlight(current_state, selected_element);
  }
});

const move = (direction) => {
  if (selected_element === null || graph === null) {
    return;
  }

  const [state, element] = model.move(
    states,
    data,
    current_state,
    selected_element,
    DIRECTIONS[direction],
  );

  if (state !== null) {
    graph.graphData(data);
    current_state = state;
    selected_element = element;
    clear_visualization();
    model.visualize(current_state);
    model.highlight(current_state, selected_element);
    highlight_node(states, graph, current_state);
  }
};

document.getElementById("up_button").addEventListener("click", () => {
  move(UP);
});

document.getElementById("down_button").addEventListener("click", () => {
  move(DOWN);
});

document.getElementById("left_button").addEventListener("click", () => {
  move(LEFT);
});

document.getElementById("right_button").addEventListener("click", () => {
  move(RIGHT);
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowUp" || event.code === "KeyW") {
    move(UP);
  } else if (event.code === "ArrowDown" || event.code === "KeyS") {
    move(DOWN);
  } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
    move(LEFT);
  } else if (event.code === "ArrowRight" || event.code === "KeyD") {
    move(RIGHT);
  }
});

//
// Set up button event-handlers
//

document.getElementById("select_model_button").addEventListener("click", () => {
  current_model = (current_model + 1) % models.length;
  model = models[current_model];
  current_initial_state = 0;
  initial_state = model.initial_states[current_initial_state];
  current_state = initial_state;
  selected_element = null;
  clear_states();
  states.add(initial_state);
  clear_graph();
  clear_visualization();
  model.visualize(initial_state);
  document.getElementById("model_name").innerHTML = model.name;
  document.getElementById("state_name").innerHTML = initial_state.name;
});

document.getElementById("select_state_button").addEventListener("click", () => {
  current_initial_state =
    (current_initial_state + 1) % model.initial_states.length;
  initial_state = model.initial_states[current_initial_state];
  current_state = initial_state;
  selected_element = null;
  clear_states();
  states.add(initial_state);
  clear_graph();
  clear_visualization();
  // graph = null;
  // graph = generate_graph(data, node_click_view_state);
  model.visualize(initial_state);
  document.getElementById("state_name").innerHTML = initial_state.name;
});

document
  .getElementById("generate_graph_button")
  .addEventListener("click", () => {
    clear_graph();
    model.generate(states, initial_state, graph, null);
    reset_graph_view(graph);
  });

document.getElementById("reset_view_button").addEventListener("click", () => {
  reset_graph_view(graph);
});

document
  .getElementById("clear_graph_button")
  .addEventListener("click", clear_graph);
