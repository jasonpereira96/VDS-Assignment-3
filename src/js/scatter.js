function scatterPlot(data, options) {

    const margin = ({top: 20, right: 30, bottom: 30, left: 40})

    const sidebar =  document.getElementById("sidebar");
    const width = sidebar.clientWidth;
    const height = sidebar.clientHeight;

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x)).nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y)).nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.x))

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .property("value", []);

    const brush = d3.brush()
        .on("start brush end", brushed);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    const dot = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        .attr("r", 3);

    svg.call(brush);

    function brushed({ selection }) {
        let value = [];
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            value = dot
                .style("stroke", "gray")
                .filter(d => x0 <= x(d.x) && x(d.x) < x1 && y0 <= y(d.y) && y(d.y) < y1)
                .style("stroke", "steelblue")
                .data();
        } else {
            dot.style("stroke", "steelblue");
        }
        svg.property("value", value).dispatch("input");
    }

    sidebar.append(svg.node());

    return svg.node();
}