export default function UnitchartGridLayout(aqTable, canvas, simulation) {
  // CANVAS SETUP
  let margin = {
    top: 100,
    right: 200,
    bottom: 100,
    left: 200,
  };

  function chart() {
    const width = canvas.attr("width") - margin.left - margin.right,
      height = canvas.attr("height") - margin.top - margin.bottom;

    const g1 = canvas.select("#figure1Group");
    const tooltip = d3.select("#tooltipContainer");

    g1.transition()
      .duration(750)
      .style("opacity", 1)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // DATA MANIPULATE

    const data = aqTable.orderby("id").objects();

    // RENDER PREPERATION
    const gap = 0.1;

    const idArray = Array.from(new Set(data.map((d) => d.id)));

    const bin =
      idArray.length == 1
        ? 1
        : Math.max(4, Math.floor(Math.sqrt(idArray.length)));

    const xValue = (d) => idArray.indexOf(d.id) % bin;

    const yValue = (d) => Math.floor(idArray.indexOf(d.id) / bin);

    const xScale = d3
      .scaleBand()
      .domain(data.map(xValue))
      .range([0, width])
      .padding(gap);

    const yScale = d3
      .scaleBand()
      .domain(data.map(yValue))
      .range([0, height])
      .padding(gap);

    // RENDER

    const rect = g1.selectAll("rect").data(data, (d) => d.id);

    rect.join(
      function (enter) {
        const rectEner = enter
          .append("rect")
          .attr("id", (d, i) => "rect" + d.id)
          .attr("stroke", "white")
          .attr("x", (d, i) => xScale(xValue(d)))
          .attr("y", (d, i) => yScale(yValue(d)))
          .attr("width", xScale.bandwidth());
        const rectEnterTransition = rectEner
          .transition()
          .duration(750)
          .style("opacity", 1)
          .attr("height", yScale.bandwidth());

        return rectEnterTransition;
      },
      function (update) {
        const rectUpdateTransition = update
          .transition()
          .duration(750)
          .attr("height", yScale.bandwidth())
          .attr("width", xScale.bandwidth())
          .attr("x", (d) => xScale(xValue(d)))
          .attr("y", (d) => yScale(yValue(d)))
          .style("opacity", 1);

        return rectUpdateTransition;
      },
      function (exit) {
        const rectExitTransition = exit
          .transition()
          .duration(750)
          .attr("y", (d) => -2 * height);

        return rectExitTransition;
      }
    );

    const rects = g1.selectAll("rect");

    rects
      .on("mouseover", (e, d) => {
        tooltip
          .style("display", "block")
          .html(() => `${d.publisher}<br><b>${d.heading}</b>`);
      })
      .on("mousemove", (e, d) => {
        tooltip
          .style("left", d3.pointer(e)[0] + "px")
          .style("top", d3.pointer(e)[1] + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      })
      .on("click", function (e, d) {
        let stroke_status = d3.select(this).attr("stroke");
        d3.select(this).attr(
          "stroke",
          stroke_status == "white" ? "red" : "white"
        );
      });
  }

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  return chart;
}
