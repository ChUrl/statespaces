export const klotski = {
  name: "Klotski",
  width: 4,
  height: 5,
  board: [
    // Center column
    [0, 1, 0, 2, 1],
    [1, 1, 2, 2, 2],
    [2, 1, 3, 1, 3],
    [3, 2, 3, 2, 3],
    // Left column
    [4, 0, 0, 0, 1],
    [5, 0, 2, 0, 3],
    [6, 0, 4, 0, 4],
    // Right column
    [7, 3, 0, 3, 1],
    [8, 3, 2, 3, 3],
    [9, 3, 4, 3, 4],
  ],
};
