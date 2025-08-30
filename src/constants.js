export const RIGHT = 0;
export const DOWN = 1;
export const LEFT = 2;
export const UP = 3;
export const DIRECTIONS = [
  [1, 0], // Right
  [0, 1], // Down
  [-1, 0], // Left
  [0, -1], // Up
];

export const HORIZONTAL = 0;
export const VERTICAL = 1;

export const invert_direction = (direction) => {
  return (DIRECTIONS.indexOf(direction) + 2) % DIRECTIONS.length;
};
