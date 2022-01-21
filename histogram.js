  // set the dimensions and margins of the graph
  var marginH = {top: 10, right: 30, bottom: 30, left: 40},
      widthH = window.innerWidth/2 - marginH.left - marginH.right,
      heightH = window.innerHeight/2 - marginH.top - marginH.bottom;
  
  const tooltipHist = d3.select('.tooltipHist').on('mouseout', function (e, d) {
            
            tooltipHist.style('display', 'none');

        });
  // append the svg object to the body of the page
  var svgHist = d3.select("#histGraph")
    .append("svg")
      .attr("width", widthH + marginH.left + marginH.right)
      .attr("height", heightH + marginH.top + marginH.bottom)
    .append("g")
      .attr("transform",
            "translate(" + marginH.left + "," + marginH.top + ")");
  

  // X axis: scale and draw:
  var xHist = d3.scaleLinear()
    //.domain([-3+d3.min(data, function(d) { return +d.num_comments }),3+d3.max(data, function(d) { return +d.num_comments })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, widthH]);
  var xAxisHist = svgHist.append("g")
        .attr("transform", "translate(0," + heightH + ")");
          //.call(d3.axisBottom(xHist));

  // Y axis: scale and draw:
  var yHist = d3.scaleLinear()
          .range([heightH, 0]);

  //yHist.domain([0, d3.max(bins1, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  var yAxisHist = svgHist.append("g");
          //.call(d3.axisLeft(yHist));


      // Handmade legend
      svgHist.append("circle").attr("cx",widthH-150).attr("cy",30).attr("r", 6).style("fill", '#F16529').style("opacity",0.6).attr("id","circlePup")
      svgHist.append("circle").attr("cx",widthH-150).attr("cy",60).attr("r", 6).style("fill", '#FCC700').style("opacity",0.6).attr("id","circlePol")
      svgHist.append("text").attr("x", widthH-130).attr("y", 30).text("puppies").style("font-size", "15px").attr("alignment-baseline","middle").attr("id","labelPup")
      svgHist.append("text").attr("x", widthH-130).attr("y", 60).text("PoliticalDiscussion").style("font-size", "15px").attr("alignment-baseline","middle").attr("id","labelPol")
    
      //d3.select("#histGraph").style("display","block");
      //d3.select("#bubbleGraph").style("display","none");
    
var bins1, bins2;
    function updateHist(){
      d3.csv("HistCSV/"+selection+".csv", function(data) {

        d3.select("#histGraph").style("display","block");
        d3.select("#bubbleGraph").style("display","none");
        d3.select(".tooltipHist").style("display","none");
        d3.select(".tooltipBubble").style("display","none");
        
        // Update the X axis
        xHist.domain([-1+d3.min(data, function(d) { return +d.value }),2+d3.max(data, function(d) { return +d.value})])
        xAxisHist
        .transition().duration(1000)
        .call(d3.axisBottom(xHist))

         // set the parameters for the histogram
        var histogram = d3.histogram()
          .value(function(d) { return +d.value; })   // I need to give the vector of value
          .domain(xHist.domain())  // then the domain of the graphic
          .thresholds(xHist.ticks(20)); // then the numbers of bins
    
        // And apply twice this function to data to get the bins.
        bins1 = histogram(data.filter( function(d){return d.group === "puppies"} ));
        bins2 = histogram(data.filter( function(d){return d.group === "PoliticalDiscussion"} ));
        //console.log(bins1);

        // Update the Y axis
        var yDom = Math.max(d3.max(bins1, function(d) {return d.length }),d3.max(bins2, function(d) {return d.length }))
        yHist.domain([0, 5+yDom ]);
        yAxisHist
        .transition().duration(1000)
        .call(d3.axisLeft(yHist));

        // append the bars for series 1
        // Create the u variable
        var u;
        
        if(d3.select("#puppiesCheck").property("checked")){
          d3.select("#circlePup").style("display","block");
          d3.select("#labelPup").style("display","block");
          u = svgHist.selectAll("rect.bins1")
        .data(bins1)
        }
        else{
          d3.select("#circlePup").style("display","none");
          d3.select("#labelPup").style("display","none");
          u = svgHist.selectAll("rect.bins1")
        .data({})
        }
        //svgHist.selectAll("rect")
        //.data(bins1)
        u
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", 1)
        .attr("class","bins1")
        .style("fill", '#F16529')
        .style("opacity", 0.6)
        .on('mouseover', function (e, d) {
            var matrixH = this.getScreenCTM().
            translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));
            
            tooltipHist.
            style("left",
            window.pageXOffset + matrixH.e + 2 + "px").
            style("top",
            window.pageYOffset + matrixH.f + 2 + "px");
            //tooltip.select('img').attr('src', d.data.img);
            tooltipHist.style('display', 'block');
            dataNow = _.shuffle(e.concat(bins2[d]));

        })
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + xHist(d.x0) + "," + yHist(d.length) + ")"; })
        .attr("width", function(d) { return xHist(d.x1) - xHist(d.x0) -1 ; })
        .attr("height", function(d) { return heightH - yHist(d.length); })
        

        

        u.exit()
        .remove()
        

        // append the bars for series 1
        // Create the u variable
        
        var v;
        if(d3.select("#PoliticalDiscussionCheck").property("checked")){
          d3.select("#circlePol").style("display","block");
          d3.select("#labelPol").style("display","block");
        //svgHist.selectAll("rect")
        //.data(bins1)
         v= svgHist.selectAll("rect.bins2")
        .data(bins2)}
        else{
          d3.select("#circlePol").style("display","none");
          d3.select("#labelPol").style("display","none");
          v = svgHist.selectAll("rect.bins2")
        .data({})
      }
        

        v
        .enter()
        .append("rect")
        .merge(v)
        .attr("x", 1)
        .attr("class","bins2")
        .style("fill", '#FCC700')
        .style("opacity", 0.6)
        .on('mouseover', function (e, d) {
            var matrixH = this.getScreenCTM().
            translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));
            
            tooltipHist.
            style("left",
            window.pageXOffset + matrixH.e + 2 + "px").
            style("top",
            window.pageYOffset + matrixH.f + 2 + "px");
            //tooltip.select('img').attr('src', d.data.img);
            //tooltipB.select('a').attr('href', e.data.name).text(e.data.name);
            tooltipHist.style('display', 'block');
            dataNow = _.shuffle(e.concat(bins1[d]));

        })
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + xHist(d.x0) + "," + yHist(d.length) + ")"; })
        .attr("width", function(d) { return xHist(d.x1) - xHist(d.x0) -1 ; })
        .attr("height", function(d) { return heightH - yHist(d.length); })
        
    

        v.exit()
        .remove()
        

      })
    };

    function clearSelectionFunction(){
      d3.select("#histGraph").style("display","none");
      d3.select("#bubbleGraph").style("display","block");
      d3.select(".tooltipHist").style("display","none");
      d3.select(".tooltipB").style("display","none");
      d3.select("#"+selection).property("checked",false);
      selection="nothing";
      d3.select('#bubble-chart').selectAll("*").remove();
      d3.csv(file, function(data){
        createBubble(data);
        });
      

    };