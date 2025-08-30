import {
  RIGHT,
  DOWN,
  LEFT,
  UP,
  DIRECTIONS,
  invert_direction,
  HORIZONTAL,
  VERTICAL,
} from "../../constants.js";
import { key_of } from "../../main.js";

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

export const states_are_equal = (state, other_state) => {
  let _state = structuredClone(state);
  let _other_state = structuredClone(other_state);

  // Disable to compare IDs aswell (explodes the state space though)
  for (let i = 0; i < state.board.length; i++) {
    // Remove IDs
    _state.board[i].splice(0, 1);
    _other_state.board[i].splice(0, 1);
  }
  _state.board.sort();
  _other_state.board.sort();

  return key_of(_state) === key_of(_other_state);
};

export const move_block = (block, direction) => {
  const [id, dir, x0, y0, x1, y1] = block;
  const [dx, dy] = direction;

  if (
    dir === HORIZONTAL &&
    (arrays_are_equal(direction, DIRECTIONS[UP]) ||
      arrays_are_equal(direction, DIRECTIONS[DOWN]))
  ) {
    console.log("Can't move block horizontally");
    return null;
  }

  if (
    dir === VERTICAL &&
    (arrays_are_equal(direction, DIRECTIONS[LEFT]) ||
      arrays_are_equal(direction, DIRECTIONS[RIGHT]))
  ) {
    console.log("Can't move block vertically");
    return null;
  }

  return [id, dir, x0 + dx, y0 + dy, x1 + dx, y1 + dy];
};

export const move_state_block = (state, block, direction) => {
  const [id, dir, x0, y0, x1, y1] = state.board[block[0]];
  const [dx, dy] = direction;

  if (
    dir === HORIZONTAL &&
    (arrays_are_equal(direction, DIRECTIONS[UP]) ||
      arrays_are_equal(direction, DIRECTIONS[DOWN]))
  ) {
    console.log("Can't move block horizontally");
    return;
  }

  if (
    dir === VERTICAL &&
    (arrays_are_equal(direction, DIRECTIONS[LEFT]) ||
      arrays_are_equal(direction, DIRECTIONS[RIGHT]))
  ) {
    console.log("Can't move block vertically");
    return;
  }

  state.board[block[0]] = [id, dir, x0 + dx, y0 + dy, x1 + dx, y1 + dy];
};

export const block_collides_with_other_block = (block, other_block) => {
  const [id0, dir0, x0, y0, x1, y1] = block;
  const [id1, dir1, x2, y2, x3, y3] = other_block;

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
  const [id, dir, x0, y0, x1, y1] = move_block(block, direction);

  // Check collisions with board borders
  if (x0 < 0 || x1 >= state.width) {
    return false;
  }
  if (y0 < 0 || y1 >= state.height) {
    return false;
  }

  // Check collisions with other blocks.
  if (block_collides(state, [id, dir, x0, y0, x1, y1])) {
    return false;
  }

  return true;
};

export const get_moves = (last_move, state) => {
  // Example move: [block, direction]
  let moves = [];

  for (let i = 0; i < state.board.length; i++) {
    const block = state.board[i];

    let dirs;
    if (block[1] === VERTICAL) {
      dirs = [DIRECTIONS[UP], DIRECTIONS[DOWN]];
    } else if (block[1] === HORIZONTAL) {
      dirs = [DIRECTIONS[LEFT], DIRECTIONS[RIGHT]];
    }

    for (let direction of dirs) {
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
