
const tooltipComm = d3.select('.tooltipComments');
// Set the dimensions and margins of the diagram
var marginTree = {top: 20, right: 90, bottom: 30, left: 90}
    widthTree = window.innerWidth - marginTree.left - marginTree.right,
    heightTree = window.innerHeight - marginTree.top - marginTree.bottom;


// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svgT = d3.select("#comments_graph")
    .attr("width", widthTree + marginTree.right + marginTree.left)
    .attr("height", heightTree + marginTree.top + marginTree.bottom)
  .append("g")
    .attr("transform", "translate("
          + marginTree.left + "," + marginTree.top + ")");

var i = 0,
    duration = 750,
    rootTree;
// declares a tree layout and assigns the size
var treemap = d3.tree().size([heightTree, widthTree]);
var treeData;
// load the external data
function createTree(nameComment){
  d3.json("authorTrees.json", function(error, treeD) {
    svgT = d3.select("#comments_graph")
    .attr("width", widthTree + marginTree.right + marginTree.left)
    .attr("height", heightTree + marginTree.top + marginTree.bottom)
  .append("g")
    .attr("transform", "translate("
          + marginTree.left + "," + marginTree.top + ")");
  // Assigns parent, children, height, depth
  treeData = d3.map(treeD).get(nameComment);
  rootTree = d3.hierarchy(treeData, function(d) { return d.children; });

  rootTree.x0 = heightTree / 2;
  rootTree.y0 = 0;

  // Collapse after the second level
  collapse(rootTree);

  update(rootTree);

  })
};

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

// This function is called by the buttons on top of the plot
function collapseAll(){
  collapse(rootTree);
  update(rootTree);
  d3.select("#expandButton").attr("disabled", null);
  d3.select("#collapseButton").attr("disabled", "disabled");
}

function clickNode(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
    if(d.children != undefined){
    d.children.forEach(clickNode);
    }
  }

function expandAll(){
  clickNode(rootTree);
  d3.select("#expandButton").attr("disabled", "disabled");
  d3.select("#collapseButton").attr("disabled", null);
}

function update(sourceTree) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(rootTree);

  // Compute the new tree layout.
  var nodesTree = treeData.descendants(),
      linksTree = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodesTree.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var nodeTree = svgT.selectAll('g.nodeTree')
      .data(nodesTree, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnterTree = nodeTree.enter().append('g')
      .attr('class', 'nodeTree')
      .attr("transform", function(d) {
        return "translate(" + sourceTree.y0 + "," + sourceTree.x0 + ")";
    })
    .on('click', click)
    .on('mouseover', function (e) {
            var matrixTree = this.getScreenCTM().
            translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));
            
            tooltipComm.
            style("left",
            window.pageXOffset + matrixTree.e + 15 + "px").
            style("top",
            window.pageYOffset + matrixTree.f - 40 + "px");
            //tooltip.select('img').attr('src', d.data.img);
            tooltipComm.select('#id_author').attr('class', e.data.author).text("Author: "+e.data.author);
            tooltipComm.select('#id_comment').attr('class', e.data.name).text("Comment: "+e.data.name);
            tooltipComm.select('#id_data').attr('class', e.data.created).text("Date: "+e.data.created);
            tooltipComm.select('#id_body').attr('class', e.data.body).text('" '+e.data.body+' "').style("font-style", "italic");
            tooltipComm.style('visibility', 'visible')
            .transition()
            .duration(300);
        })
    .on('mouseout', function () {
      tooltipComm.style('visibility', 'hidden');
      });

  // Add Circle for the nodes
  nodeEnterTree.append('circle')
      .attr('class', 'nodeTree')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnterTree.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdateTree = nodeEnterTree.merge(nodeTree);

  // Transition to the proper position for the node
  nodeUpdateTree.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdateTree.select('circle.nodeTree')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExitTree = nodeTree.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + sourceTree.y + "," + sourceTree.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExitTree.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExitTree.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var linkTree = svgT.selectAll('path.linkTree')
      .data(linksTree, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnterTree = linkTree.enter().insert('path', "g")
      .attr("class", "linkTree")
      .attr('d', function(d){
        var o = {x: sourceTree.x0, y: sourceTree.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdateTree = linkEnterTree.merge(linkTree);

  // Transition back to the parent element position
  linkUpdateTree.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExitTree = linkTree.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: sourceTree.x, y: sourceTree.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodesTree.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    d3.select("#expandButton").attr("disabled", "disabled");
    d3.select("#collapseButton").attr("disabled", null);
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}


function createTreeVisualisation(){
  d3.select("#authorGraphDiv").style("display","none");
  d3.select('#comments_graph').selectAll("*").remove();
  d3.select("#commGraphDiv").style("display","block");
  createTree("t3_"+nameCommentRoot);
  scrollToElem(10, 2000, '#commGraphDiv');
}