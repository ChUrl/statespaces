import ForceGraph3D from "3d-force-graph";
import { get_viewport_dims } from "./viewport.js";
import { states_are_equal } from "./simulator/sliding_blocks/state.js";

export const generate_graph = (data, node_click_handler) => {
  let graph = ForceGraph3D()(document.getElementById("graph"))
    // Input the data into the graph
    .graphData(data)

    // Set up the styling
    .backgroundColor("#FFFFFF")
    .nodeColor(["#555555"])
    .linkColor(["#000000"])
    .nodeRelSize([15])
    .nodeResolution([1])
    .linkResolution([1])

    // Set up the interactions
    .onNodeHover(
      (node) => (document.body.style.cursor = node ? "pointer" : null),
    )
    .onNodeClick((node) => {
      node_click_handler(node, graph);
    });

  graph.d3Force("link").distance(35);
  // graph.warmupTicks([100]);
  // graph.cooldownTicks([0]);

  reset_graph_view(graph);

  return graph;
};

export const node_click_zoom = (node, graph) => {
  const distance = 40;
  const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
  graph.cameraPosition(
    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
    { x: node.x, y: node.y, z: node.z },
    1000,
  );
};

export const reset_graph_view = (graph) => {
  if (graph === null) {
    return;
  }

  const [vw, vh] = get_viewport_dims();
  graph
    .width(vw / 2 - 9.5)
    .height(vh - 43)
    .zoomToFit();
};

export const highlight_node = (states, graph, current_state) => {
  graph.nodeColor((node) => {
    if (states_are_equal(states.get(node.id), current_state)) {
      return "#FF0000";
    }

    return "#555555";
  });
};
