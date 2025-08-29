import "./graph.js";
import {
  generate_graph,
  reset_graph_view,
  generate_sample_data,
} from "./graph.js";

let data = null;
let graph = null;

const clear = () => {
  document.getElementById("graph").innerHTML = "";
  graph = null;
  data = null;
};

// Set up button event-handlers
document
  .getElementById("generate_graph_button")
  .addEventListener("click", () => {
    clear();
    data = generate_sample_data();
    graph = generate_graph(data);
  });
document.getElementById("reset_view_button").addEventListener("click", () => {
  reset_graph_view(graph);
});
document.getElementById("clear_graph_button").addEventListener("click", clear);
