import { single } from "./initial_states/single.js";
import { two } from "./initial_states/two.js";
import { three } from "./initial_states/three.js";
import { four } from "./initial_states/four.js";
import { small_klotski_like } from "./initial_states/small_klotski_like.js";
import { klotski } from "./initial_states/klotski.js";
import {
  get_moves,
  block_is_movable,
  move_block,
  move_state_block,
} from "./state.js";
import { key_of } from "../../main.js";

const initial_states = [single, two, three, four, small_klotski_like, klotski];

const generate = (states, initial_state, graph, previous_move) => {
  const stack = [[initial_state, previous_move]];

  let last_print = 0;

  let data = graph.graphData();

  while (stack.length > 0) {
    const [current_state, prev_move] = stack.pop();

    const moves = get_moves(prev_move, current_state);
    for (const m of moves) {
      const [block, direction] = m;

      const states_before = states.length;
      const [new_state, new_block] = move(
        states,
        data,
        current_state,
        block,
        direction,
      );
      const states_after = states.length;

      if (states_after - last_print > 250) {
        console.log(`Generating: Found ${states_after} states...`);
        last_print = states_after;
      }

      // Arbitrary upper limit in case of errors
      if (states_after > 100000) {
        return;
      }

      if (states_after > states_before) {
        stack.push([new_state, m]);
      }
    }
  }

  graph.graphData(data);
};

const select = (state, offsetX, offsetY) => {
  const canvas = document.getElementById("model_canvas");

  const square_width = canvas.width / state.width;
  const square_height = canvas.height / state.height;

  const x = Math.floor(offsetX / square_width);
  const y = Math.floor(offsetY / square_height);

  for (let i = 0; i < state.board.length; i++) {
    const [id, x0, y0, x1, y1] = state.board[i];

    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      return [id, x0, y0, x1, y1];
    }
  }

  return null;
};

const move = (states, data, state, block, direction) => {
  if (!block_is_movable(state, block, direction)) {
    return [null, null];
  }

  let new_state;
  try {
    new_state = structuredClone(state);
    delete new_state.name; // Only need this for the initial state
  } catch (e) {
    console.log(e);
    return [null, null];
  }
  let new_block = move_block(block, direction);
  move_state_block(new_state, block, direction);

  const new_link = {
    source: key_of(state), // We're coming from this state...
    target: key_of(new_state), // ...and ended up here, at a previous state.
  };

  let new_node = null;
  if (!states.has(new_state)) {
    states.add(new_state);
    new_node = {
      id: key_of(new_state),
    };
  }

  data.links.push(new_link);
  if (new_node !== null) {
    data.nodes.push(new_node);
  }

  return [new_state, new_block];
};

const rect = (context, x0, y0, x1, y1, square_width, square_height, color) => {
  const x = x0 * square_width;
  const y = y0 * square_height;
  const width = (x1 - x0 + 1) * square_width;
  const height = (y1 - y0 + 1) * square_height;

  context.fillStyle = color;
  context.fillRect(x, y, width, height);

  context.strokeStyle = "#000000";
  context.lineWidth = 1;
  context.strokeRect(x, y, width, height);
};

const visualize = (state) => {
  const canvas = document.getElementById("model_canvas");
  const context = canvas.getContext("2d");

  const square_width = canvas.width / state.width;
  const square_height = canvas.height / state.height;

  // console.log(`Canvas: (${canvas.width}x${canvas.height})`);
  // console.log(`Klotski 1x1 Size: (${square_width}x${square_height})`);

  for (let i = 0; i < state.board.length; i++) {
    const [id, x0, y0, x1, y1] = state.board[i];

    rect(context, x0, y0, x1, y1, square_width, square_height, "#555555");
  }
};

const highlight = (state, block) => {
  const [id, x0, y0, x1, y1] = block;

  const canvas = document.getElementById("model_canvas");
  const context = canvas.getContext("2d");

  const square_width = canvas.width / state.width;
  const square_height = canvas.height / state.height;

  rect(context, x0, y0, x1, y1, square_width, square_height, "#AAAAAA");
};

const visualize_path = (from_state, to_state) => {
  // Find path (general graph helper function)
  // For each state in path: visualize(state)
};

export const sliding_blocks_model = {
  name: "Sliding Blocks",
  generate,
  visualize,
  highlight,
  visualize_path,
  initial_states,
  select,
  move,
};
