let xmlhttp = new XMLHttpRequest();
let svg;
const width = 900;
const height = 500;

const createTitle = () => {
    return d3.select("main")
             .append("title")
             .attr("id", "title")
             .text("United States GDP");
};

const createCanvas = () => {
    return d3.select("main")
             .append("svg")
             .attr("width", width)
             .attr("height", height);
};

const createTooltip = () => {
    return d3.select("body")
             .append("div")
             .attr("id", "tooltip")
             .style('opacity', 0);
};

const sendRequestToAPI = (xmlhttp) => {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    xmlhttp.open("GET", url, true);
    return xmlhttp;
};

const calculateScales = (dates, values) => {
    const minDate = d3.min(dates, (d) => new Date(d));
    const maxDate = d3.max(dates, (d) => new Date(d));
    const maxValue = d3.max(values, (d) => d);
    const xScale = d3.scaleTime()
                     .domain([minDate, maxDate])
                     .range([60, width - 20]);
    const yScale = d3.scaleLinear()
                     .domain([0, maxValue])
                     .range([height - 30, 30]);
    return {xScale, yScale};
};

const createAxes= (scales, svg) => {
    svg.append("g")
       .attr("id", "x-axis")
       .call(d3.axisBottom(scales.xScale))
       .attr("transform", `translate(0, ${height - 30})`);
    
    svg.append("g")
       .attr("id", "y-axis")
       .call(d3.axisLeft(scales.yScale))
       .attr("transform", "translate(60)")
       .attr("class", "tick");

    svg.append('text')
       .attr('transform', 'rotate(-90)')
       .attr('x', -200)
       .attr('y', 80)
       .text('Gross Domestic Product');
};

const createBars = (dates, values, scales, datesForTooltip) => {
    svg.selectAll("rect")
       .data(values)
       .enter()
       .append("rect")
       .attr("x", (d, i) => scales.xScale(new Date(dates[i])))
       .attr("y", (d) => scales.yScale(d))
       .attr("width", (width - 80) / values.length)
       .attr("height", (d) => height - scales.yScale(d) - 30)
       .attr("class", "bar")
       .attr("data-date", (d, i) => dates[i])
       .attr("data-gdp", (d) => d)
       .on("mouseover", (e, d) => {
        const billionsForTooltip = d.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') //RegEx to convert the provided GDP values from the JSON to readable billions for the tooltip
        d3.select("#tooltip")
                .style("opacity", 0.85)
                .style("left", e.pageX + 6 + "px")
                .style("top", e.pageY + "px")
                .html(
                    datesForTooltip[values.indexOf(d)] +
                    "<br>" +
                    "$" +
                    billionsForTooltip +
                    " Billion"
                )
                .attr("data-date", dates[values.indexOf(d)]);
               //.style('left', values.indexOf(d) * ((width - 80) / values.length) + 0 + 'px')
               //.style('top', height - d + 'px')
       })
       .on("mouseout", () => {
        return d3.select("#tooltip")
               .style("opacity", 0)
               .style("left", 0)
               .style("right", 0);
       });
};

xmlhttp.onload = () => { //onload() is automatically called by the XHR architecture after send()
    const dates = [];
    const values = [];
    const dataset = JSON.parse(xmlhttp.responseText);
    dataset.data.forEach(elem => {
        dates.push(elem[0]);
        values.push(elem[1]);
    });
    const datesForTooltip = dates.map((date) => {
        let quarter;
        const month = date.substring(5, 7);
        switch (month) {
            case "01":
                quarter = "Q1";
                break;
            case "04":
                quarter = "Q2";
                break;
            case "07":
                quarter = "Q3";
                break;
            case "10":
                quarter = "Q4";
                break;
            default:
                quarter = "unk. Q";
                break;
        }
        return date.substring(0, 4) + " " + quarter;
    });

    const scales = calculateScales(dates, values);
    createAxes(scales, svg);
    createBars(dates, values, scales, datesForTooltip);
};

const driver = () => {
    createTitle();
    svg = createCanvas();
    createTooltip();
    xmlhttp = sendRequestToAPI(xmlhttp);
    xmlhttp.send(); //this will include a call to the onload() we defined above
};

driver();
