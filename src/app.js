import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json').then((response) => {
  return response.json();
}).then((data) => {
  let margin;
  let height, width;
  let barHeight, barWidth;
  let x,y;
  let legendMonth, legendYear;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const minYear = d3.min(data.monthlyVariance.map((sample) => sample.year));
  const averageTemperature = data.baseTemperature;
  const temperatureData = data.monthlyVariance.map((sample) => averageTemperature + sample.variance);
  const minTemp = d3.min(temperatureData).toFixed(2);
  const maxTemp = d3.max(temperatureData).toFixed(2);

  const colours = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];
  const getColour = (temperature) => colours[Math.floor((temperature - minTemp) / ((maxTemp - minTemp) / colours.length))];

  let svg = d3.select('#container').append('svg');
  let popup = d3.select('body').append('div');

  main();

  function main() {
    popup.attr('class', 'tooltip')
      .style('opacity', 0);

    setSizes();
    drawGraph();
  }

  function setSizes() {
    margin = { top: 20, right: 80, bottom: 60, left: 80 };
    height = 480 - margin.top - margin.bottom;
    width = 1020 - margin.left - margin.right;
    barHeight = height / 12;
    barWidth = width / data.monthlyVariance.length / 12;
    legendYear = 1900;
    legendMonth = 10;

    x = d3.scaleTime().range([0, width]);
    y = d3.scaleBand().range([0, height]);
    x.domain([new Date(1753, 0), new Date(2016, 0)]);
    y.domain([
      new Date(1753, 0), new Date(1753, 1), new Date(1753, 2), 
      new Date(1753, 3), new Date(1753, 4), new Date(1753, 5), 
      new Date(1753, 6), new Date(1753, 7), new Date(1753, 8),
      new Date(1753, 9), new Date(1753, 10), new Date(1753, 11)
    ]);

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  } 

  function drawGraph() {
    svg.append('g')
      .attr('transform', `translate(${width/15}, ${height+10})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')));

    svg.append('text')
      .attr('y', height + margin.bottom - 10)
      .attr('x', height)
      .style('text-anchor', 'middle')
      .text('Years');

    svg.append('g')
      .attr('transform', `translate(${width/15}, 10)`)
      .call(d3.axisLeft(y).tickSize(0).tickFormat(d3.timeFormat('%B')));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - 1.5 * margin.right)
      .attr('x', 0 - height/2)
      .style('text-anchor', 'middle')
      .text('Months');

    svg.append('g').selectAll('rect')
      .data(data.monthlyVariance).enter()
      .append('rect')
      .attr('width', 142.5 * barWidth)
      .attr('height', barHeight)
      .attr('x', (d) => (d.year - minYear) * barWidth)
      .attr('y', (d) => (d.month - 1) * barHeight)
      .attr('fill', (d) => getColour(d.variance + averageTemperature))
      .attr('transform', (d) => `translate(${(d.year - minYear) * barWidth * 142.5 + width/15}, ${barHeight-23})`)
      .on('mouseover', (d) => mouseover(d)) 
      .on('mouseout', mouseout);

    setLegend();
  }

  function mouseover(d) {
    popup.transition()
      .duration(200)
      .style('opacity', 0.9)
    popup.html(`
          <div id='first-row-popup'>${months[d.month - 1]}, ${d.year}</div>
          <div id='temperature'>Temp: ${(d.variance + averageTemperature).toFixed(2)}</div>
          <div id='variance'>Variance: ${d.variance}</div>
          `)
      .style('left', (d3.event.pageX + 5) + 'px')
      .style('top', (d3.event.pageY - 50) + 'px')
  }

  function mouseout() {
    popup.transition()
      .duration(500)
      .style('opacity', 0)
  }

  function setLegend() {
    for (let legendColour = 0; legendColour < colours.length; legendColour++) {
      svg.append('g').append('rect')
        .attr('width', 1500 * barWidth)
        .attr('height', 2 * barHeight / 3)
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', () => colours[legendColour])
        .attr('transform', `translate(${(legendYear - minYear) * barWidth * (142 + legendColour * barWidth * 380)}, ${barHeight + legendMonth * 39 + 10})`)

      svg.append('g').append('text')
        .attr('x', (legendYear - minYear) * barWidth * (143 + legendColour * barWidth * 380))
        .attr('y', barHeight + legendMonth * 42.5 + 10)
        .attr('text-anchor', 'left')
        .style('font-size', '10px')
        .text((eval(minTemp) + legendColour * (maxTemp - minTemp) / 11).toFixed(2));
    }
  }
  
});