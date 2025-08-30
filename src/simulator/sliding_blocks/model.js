import { single } from "./initial_states/single.js";
import { two } from "./initial_states/two.js";
import { three } from "./initial_states/three.js";
import { four } from "./initial_states/four.js";
import { small_klotski_like } from "./initial_states/small_klotski_like.js";
import { klotski } from "./initial_states/klotski.js";
import {
  get_moves,
  block_is_movable,
  index_of_state,
  remove_block,
  move_block,
  insert_block,
  move_state_block,
} from "./state.js";

const initial_states = [single, two, three, four, small_klotski_like, klotski];

const generate = (states, initial_state, graph, previous_move) => {
  const stack = [[initial_state, previous_move]];

  let last_print = 0;

  while (stack.length > 0) {
    const [current_state, prev_move] = stack.pop();

    const moves = get_moves(prev_move, current_state);
    for (const m of moves) {
      const [block, direction] = m;

      const states_before = states.length;
      const [new_state, new_block] = move(
        states,
        graph,
        current_state,
        block,
        direction,
      );
      const states_after = states.length;

      if (states_after - last_print > 250) {
        console.log(`Generating: Found ${states_after} states...`);
        last_print = states_after;
      }

      if (states_after > states_before) {
        stack.push([new_state, m]);
      }
    }
  }
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

const move = (states, graph, state, block, direction) => {
  if (!block_is_movable(state, block, direction)) {
    return [null, null];
  }

  // let new_state = remove_block(state, block);
  // let new_block = move_block(block, direction);
  // insert_block(new_state, block);

  let new_state;
  try {
    new_state = structuredClone(state);
  } catch (e) {
    console.log(e);
    return [null, null];
  }
  let new_block = move_block(block, direction);
  move_state_block(new_state, block, direction);

  // TODO: Make states into a hashmap?
  let index = index_of_state(states, new_state);

  let new_link = null;
  let new_node = null;
  if (index !== null) {
    // We already had this state, just generate a link
    new_link = {
      source: index_of_state(states, state), // We're coming from this state...
      target: index, // ...and ended up here, at a previous state.
    };
  } else {
    states.push(new_state);
    new_node = {
      id: states.length - 1,
    };
    new_link = {
      source: index_of_state(states, state), // We're coming from this state...
      target: states.length - 1, // ...and ended up here, at a new state.
    };
  }

  const data = graph.graphData();

  // TODO: Faster without this?
  const has_link = (data, link) => {
    // for (let l of data.links) {
    //   if (l.source.id === link.source && l.target.id === link.target) {
    //     return true;
    //   }
    //   if (l.source.id === link.target && l.target.id === link.source) {
    //     return true;
    //   }
    // }

    return false;
  };

  if (new_node !== null) {
    graph.graphData({
      nodes: [...data.nodes, new_node],
      links: [...data.links, new_link],
    });
  } else if (!has_link(data, new_link)) {
    graph.graphData({
      nodes: data.nodes,
      links: [...data.links, new_link],
    });
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
