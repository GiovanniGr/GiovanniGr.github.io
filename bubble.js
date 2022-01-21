const file = 'bubble.csv';
var widthB = window.innerWidth*0.7;
var heightB = window.innerHeight*0.7;
const colors = {
    puppies: '#F16529',
    js: '#1C88C7',
    PoliticalDiscussion: '#FCC700'
};

d3.csv(file, function(data){
    createBubble(data);
});

function createBubble(data2){
    d3.select('#bubble-chart').selectAll("*").remove();
    d3.select("#histGraph").style("display","none");
    d3.select("#bubbleGraph").style("display","block");
    d3.select(".tooltipHist").style("display","none");
    d3.select(".tooltipBubble").style("display","none");

    dataNow=data2;
    var data1=[];
    if(d3.select("#puppiesCheck").property("checked"))
    {
        data1 = _.shuffle(data1.concat(data2.filter( function(d){return d.group === "puppies"} )));
    }
    if(d3.select("#PoliticalDiscussionCheck").property("checked"))
    {
        data1 = _.shuffle(data1.concat(data2.filter( function(d){return d.group === "PoliticalDiscussion"} )))
    }
    var range = d3.extent(data1, function(d) { return +d.value });
    var titolo1;
    if(selection=="nothing")
    {
        if(d3.select("#puppiesCheck").property("checked") & d3.select("#PoliticalDiscussionCheck").property("checked"))
        {
            titolo1 = "Bubble Chart for all submission for both subreddits"
        
        }
        else if(d3.select("#PoliticalDiscussionCheck").property("checked"))
        {
                titolo1 = "Bubble Chart for all submission for PoliticalDiscussion"
        }
        else if(d3.select("#puppiesCheck").property("checked"))
        {
                titolo1 = "Bubble Chart for all submission for puppies"
        }
    }
    else if(d3.select("#puppiesCheck").property("checked") & d3.select("#PoliticalDiscussionCheck").property("checked"))
    {
        if(range[0]==range[1])
        {
            titolo1 = "Bubble Chart for "+selection+"="+range[0]+", for both subreddits"
        }
        else
        {
            titolo1 = "Bubble Chart for "+selection+" in ["+range+"], for both subreddits"
        }
    }
    else if(d3.select("#PoliticalDiscussionCheck").property("checked"))
    {
        if(range[0]==range[1])
        {
            titolo1 = "Bubble Chart for "+selection+"="+range[0]+", for PoliticalDiscussion"
        }
        else
        {
            titolo1 = "Bubble Chart for "+selection+" in ["+range+"], for PoliticalDiscussion"
        }
    }
    else if(d3.select("#puppiesCheck").property("checked"))
    {
        if(range[0]==range[1])
        {
            titolo1 = "Bubble Chart for "+selection+"="+range[0]+", for puppies"
        }
        else
        {
            titolo1 = "Bubble Chart for "+selection+" in ["+range+"], for puppies"
        }
    }
    else
    {
        titolo1 = "Select at least one subreddit"
    }

    d3.select("#titoloBubble").text(titolo1);

    
    
    const bubble = data1 => d3.pack()
        .size([widthB, heightB])
        .padding(2)(d3.hierarchy({ children: data1 }).sum(d => d.value));

    const svgB = d3.select('#bubble-chart')
        .style('width', widthB)
        .style('height', heightB);
    
    const rootB = bubble(data1);
    
    //.on('mouseout', function (e, d) {
    //    tooltipB.style('visibility', 'hidden');
    //})
    ;

    const nodeB = svgB.selectAll()
        .data(rootB.children)
        .enter().append('g')
        .attr('transform', `translate(${widthB / 2}, ${heightB / 2})`);
    
const tooltipB = d3.select('.tooltipBubble');
        tooltipB.style("visibility", "visible");
        const circleB = nodeB.append('circle')
        .style('fill', d => colors[d.data.group])
        .on('mouseover', function (e, d) {
            var matrixB = this.getScreenCTM().
            translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));
            
            tooltipB.
            style("left",
            window.pageXOffset + matrixB.e + 2 + "px").
            style("top",
            window.pageYOffset + matrixB.f + 2 + "px");
            nameCommentRoot = e.data.name;
            console.log(e);
            //tooltip.select('img').attr('src', d.data.img);
            tooltipB.select('a').attr('href', "https://www.reddit.com/r/"+e.data.group+"/comments/"+e.data.name+"/").text("Discussion: "+e.data.name);
            tooltipB.select('span').attr('class', e.data.group).text(e.data.group);
            tooltipB.style('display', 'block')
            .transition()
            .duration(300);

            d3.select(this).style('stroke', '#222').style("stroke-width", 2)
        })
        //.on('mousemove', e => tooltip.style('top', `${e.pageY}px`)
        //                             .style('left', `${e.pageX + 10}px`))
        .on('mouseout', function () {
            d3.select(this).style('stroke', 'none');
        })
        //.on('click', (e, d) => window.open(d.data.link));
    
    const labelB = nodeB.append('text')
        .attr('dy', 2)
        .text(d => d.data.name.substring(0, d.r / 3))
        .attr("class","textBubble");

    nodeB.transition()
        .ease(d3.easeExpInOut)
        .duration(1000)
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    circleB.transition()
        .ease(d3.easeExpInOut)
        .duration(1000)
        .attr('r', d => d.r);
    
    labelB.transition()
        .delay(700)
        .ease(d3.easeExpInOut)
        .duration(1000)
        .style('opacity', 1);
}

function provaCiao(){
    console.log(bins1)
}

function scrollTween(offset) {
    return function() {
      var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
      return function(t) { scrollTo(0, i(t)); };
    };
  }
  
  
  function scrollToElem(delay, duration, selector){
      var offset = $(selector).offset().top - window.scrollY;
      
      d3.transition()
          .delay(delay)
          .duration(duration)
          .tween("scroll", scrollTween(offset));
  
  }
  