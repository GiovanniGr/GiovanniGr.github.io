const tooltipAut = d3.select('.tooltipAuthors');

var svgG = d3.select("#author_graph"),
        width = +svgG.attr("width"),
        height = +svgG.attr("height"),
        nodeG,
        linkG;

    

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(2))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

        var graphG;
    function createGraph(name){
        d3.json("authorGraphs.json", function (error, G) {
            svgG = d3.select("#author_graph");
            svgG.append('defs').append('marker')
                .attrs({'id':'arrowhead',
                    'viewBox':'-0 -5 10 10',
                    'refX':13,
                    'refY':0,
                    'orient':'auto',
                    'markerWidth':8,
                    'markerHeight':8,
                    'xoverflow':'visible'})
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#999')
                .style('stroke','none');
            if (error) throw error;
            console.log(name);
            graphG = d3.map(G).get(name);
            console.log(graphG);
            updateG(graphG.links, graphG.nodes);
        });
    };

    function updateG(linksG, nodesG) {
        linkG = svgG.selectAll(".linkG")
            .data(linksG)
            .enter()
            .append("line")
            .attr("class", "linkG")
            .attr('marker-end','url(#arrowhead)')

        linkG.append("title")
            .text(function (d) {return d.type;});

        edgepathsG = svgG.selectAll(".edgepathG")
            .data(linksG)
            .enter()
            .append('path')
            .attrs({
                'class': 'edgepathG',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'id': function (d, i) {return 'edgepathG' + i}
            })
            .style("pointer-events", "none");

        edgelabelsG = svgG.selectAll(".edgelabelG")
            .data(linksG)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attrs({
                'class': 'edgelabelG',
                'id': function (d, i) {return 'edgelabelG' + i},
                'font-size': 10,
                'fill': '#aaa'
            });

        edgelabelsG.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepathG' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.type});

        nodeG = svgG.selectAll(".nodeG")
            .data(nodesG)
            .enter()
            .append("g")
            .attr("class", "nodeG")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    //.on("end", dragended)
            );

        nodeG.append("circle")
            .attr("r", 10)
            .style("fill", function(d) { return (d.first_author == 1 ? "#D35237" : "lightsteelblue"); }) //"lightsteelblue")
            .on('mouseover', function (e,i) {
                var matrixGraph = this.getScreenCTM().
                translate(+this.getAttribute("cx"),
                +this.getAttribute("cy"));
                
                tooltipAut.
                style("left",
                window.pageXOffset + matrixGraph.e + 15 + "px").
                style("top",
                window.pageYOffset + matrixGraph.f - 40 + "px");
                //tooltip.select('img').attr('src', d.data.img);
                tooltipAut.select('#id_author_G').attr('class', e.name).text("Author: "+e.name);
                tooltipAut.select('#id_comments_G').attr('class', e.comments_body).text("Comments: "+e.comments_body).style("font-style", "italic");
                

                tooltipAut.style('visibility', 'visible')
                .transition()
                .duration(100);
            })
        .on('mouseout', function () {
            tooltipAut.style('visibility', 'hidden');
          });

        nodeG.append("title")
            .text(function (d) {return d.id;});

        nodeG.append("text")
            .attr("dy", -3)
            .attr('class','textG')
            .text(function (d) {return d.name;});

        simulation
            .nodes(nodesG)
            .on("tick", ticked);

        simulation.force("link")
            .links(linksG);
    }

    function ticked() {
        linkG
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});

        nodeG
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

        edgepathsG.attr('d', function (d) {
            return 'M ' + d.source.y + ' ' + d.source.x +
            ' C ' +  (d.source.y + d.target.y)/2 + ' ' + d.source.x + ','+
            (d.source.y + d.target.y)/2 + ' ' + d.target.x + ','+
            d.target.y + ' ' + d.target.x;
            'M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}'
        });

        edgelabelsG.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

//    function dragended(d) {
//        if (!d3.event.active) simulation.alphaTarget(0);
//        d.fx = undefined;
//        d.fy = undefined;
//    }

function createGraphVisualisation(){
    d3.select("#commGraphDiv").style("display","none");
    d3.select("#authorGraphDiv").style("display","block");
    d3.select('#author_graph').selectAll("*").remove();
    createGraph("t3_"+nameCommentRoot);
    scrollToElem(10, 2000, '#authorGraphDiv');
  }