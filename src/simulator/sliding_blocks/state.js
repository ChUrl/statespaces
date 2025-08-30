import {
  RIGHT,
  DOWN,
  LEFT,
  UP,
  DIRECTIONS,
  invert_direction,
} from "../../constants.js";

export const arrays_are_equal = (array, other_array) => {
  if (array.length != other_array.length) {
    return false;
  }

  for (let i = 0; i < array.length; i++) {
    if (array[i] !== other_array[i]) {
      return false;
    }
  }

  return true;
};

export const state_contains_block = (state, block) => {
  return (
    state.board.length >= block[0] &&
    arrays_are_equal(state.board[block[0]], block)
  );

  // for (let i = 0; i < state.board.length / 4; i++) {
  //   const other_block = state.board.slice(i * 4, (i + 1) * 4);
  //
  //   if (arrays_are_equal(block, other_block)) {
  //     return true;
  //   }
  // }
  //
  // return false;
};

export const states_are_equal = (state, other_state) => {
  if (state.board.length != other_state.board.length) {
    return false;
  }

  for (let i = 0; i < state.board.length; i++) {
    if (!arrays_are_equal(state.board[i], other_state.board[i])) {
      return false;
    }
  }

  return true;

  // for (let i = 0; i < state.board.length / 4; i++) {
  //   const block = state.board.slice(i * 4, (i + 1) * 4);
  //
  //   if (!state_contains_block(other_state, block)) {
  //     return false;
  //   }
  // }
  //
  // return true;
};

export const index_of_state = (states, state) => {
  for (let i = 0; i < states.length; i++) {
    if (states_are_equal(states[i], state)) {
      return i;
    }
  }

  return null;
};

export const remove_block = (state, block) => {
  let new_state = structuredClone(state);

  new_state.board.splice(block[0], 1);

  return new_state;

  // for (let i = 0; i < state.board.length / 4; i++) {
  //   const other_block = state.board.slice(i * 4, (i + 1) * 4);
  //
  //   if (arrays_are_equal(block, other_block)) {
  //     new_state.board.splice(i * 4, 4);
  //   }
  // }
  //
  // return new_state;
};

export const insert_block = (state, block) => {
  state.board.splice(block[0], 0, block);
};

export const move_block = (block, direction) => {
  const [id, x0, y0, x1, y1] = block;
  const [dx, dy] = direction;

  return [id, x0 + dx, y0 + dy, x1 + dx, y1 + dy];
};

export const move_state_block = (state, block, direction) => {
  const [id, x0, y0, x1, y1] = state.board[block[0]];
  const [dx, dy] = direction;

  state.board[block[0]] = [id, x0 + dx, y0 + dy, x1 + dx, y1 + dy];
};

export const block_collides_with_other_block = (block, other_block) => {
  const [id0, x0, y0, x1, y1] = block;
  const [id1, x2, y2, x3, y3] = other_block;

  // Don't check for self-collisions
  if (id0 === id1) {
    return false;
  }

  // Creates a set containing all x or y coordinates occupied by the block
  const span = (a0, a1) => {
    const start = Math.min(a0, a1);
    const end = Math.max(a0, a1);

    let set = new Set();
    for (let i = start; i <= end; i++) {
      set.add(i);
    }
    return set;
  };

  // Checks if two sets intersect
  const intersects = (set0, set1) => {
    for (const e of set0)
      if (set1.has(e)) {
        return true;
      }
    return false;
  };

  const xs0 = span(x0, x1);
  const ys0 = span(y0, y1);
  const xs1 = span(x2, x3);
  const ys1 = span(y2, y3);

  // If block and other_block have a shared x and y coordinate, they intersect
  return intersects(xs0, xs1) && intersects(ys0, ys1);
};

export const block_collides = (state, block) => {
  for (let i = 0; i < state.board.length; i++) {
    const other_block = state.board[i];

    if (block_collides_with_other_block(block, other_block)) {
      return true;
    }
  }

  return false;
};

export const block_is_movable = (state, block, direction) => {
  // Move the block, then check if the block would intersect or collide
  const [id, x0, y0, x1, y1] = move_block(block, direction);

  // Check collisions with board borders
  if (x0 < 0 || x1 >= state.width) {
    return false;
  }
  if (y0 < 0 || y1 >= state.height) {
    return false;
  }

  // Check collisions with other blocks.
  // We remove the block being checked from the board so it doesn't self-collide,
  if (block_collides(state, [id, x0, y0, x1, y1])) {
    return false;
  }

  return true;
};

export const get_moves = (last_move, state) => {
  // Example move: [block, direction]
  let moves = [];

  for (let i = 0; i < state.board.length; i++) {
    const block = state.board[i];

    for (let direction of DIRECTIONS) {
      if (
        last_move !== null &&
        arrays_are_equal(last_move[0], block) &&
        arrays_are_equal(last_move[1], invert_direction(direction))
      ) {
        // We don't want to move the block back to where we came from...
        continue;
      }

      if (block_is_movable(state, block, direction)) {
        moves.push([block, direction]);
      }
    }
  }

  return moves;
};
