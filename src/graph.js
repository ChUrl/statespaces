import ForceGraph3D from "3d-force-graph";

export const generate_sample_data = () => {
  // Example data:
  // {
  //     "nodes": [
  //         {
  //           "id": "id1",
  //           "name": "name1",
  //           "val": 1
  //         },
  //         {
  //           "id": "id2",
  //           "name": "name2",
  //           "val": 10
  //         },
  //         ...
  //     ],
  //     "links": [
  //         {
  //             "source": "id1",
  //             "target": "id2"
  //         },
  //         ...
  //     ]
  // }
  let data = {
    nodes: [...Array(50).keys()].map((i) => ({ id: i })),
    links: [...Array(50).keys()]
      .filter((id) => id)
      .map((id) => ({
        source: id,
        target: Math.round(Math.random() * (id - 1)),
      })),
  };

  return data;
};

export const generate_graph = (data) => {
  // TODO: Highlight the current state by coloring the node
  let graph = ForceGraph3D()(document.getElementById("graph"))
    // Input the data into the graph
    .graphData(data)

    // Set up the styling
    .backgroundColor("#FFFFFF")
    .nodeColor(["#555555"])
    .linkColor(["#000000"])

    // Set up the interactions
    .onNodeHover(
      (node) => (document.body.style.cursor = node ? "pointer" : null),
    )
    .onNodeClick((node) => {
      // TODO: Visualize the clicked state in the GameView
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        { x: node.x, y: node.y, z: node.z },
        1000,
      );
    });

  reset_graph_view(graph);

  return graph;
};

const get_viewport_dims = () => {
  let vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  let vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );

  return [vw, vh];
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
