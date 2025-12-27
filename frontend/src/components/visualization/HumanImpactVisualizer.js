// D3.js-powered visualization for human impact narratives
import * as d3 from 'd3';

class HumanImpactVisualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.svg = null;
    this.data = null;
  }

  // Initialize the visualization
  init() {
    // Create SVG container
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '500px')
      .attr('viewBox', '0 0 1000 500')
      .attr('preserveAspectRatio', 'xMidYMid meet');
      
    // Add title
    this.svg.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text('Human Impact of Equipment Downtime');
      
    // Add styles
    this.addStyles();
  }

  // Add CSS styles
  addStyles() {
    const style = `
      .title {
        font-size: 24px;
        font-weight: bold;
        fill: #2c3e50;
      }
      
      .axis path,
      .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
      }
      
      .axis text {
        font-family: sans-serif;
        font-size: 12px;
      }
      
      .bar {
        fill: steelblue;
        transition: fill 0.3s;
      }
      
      .bar:hover {
        fill: #e74c3c;
      }
      
      .impact-line {
        fill: none;
        stroke: #e74c3c;
        stroke-width: 3;
      }
      
      .impact-point {
        fill: #e74c3c;
        stroke: white;
        stroke-width: 2;
      }
      
      .impact-label {
        font-family: sans-serif;
        font-size: 12px;
        text-anchor: middle;
      }
      
      .tooltip {
        position: absolute;
        padding: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 5px;
        pointer-events: none;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s;
      }
    `;
    
    // Add styles to document
    if (!document.querySelector('#human-impact-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'human-impact-styles';
      styleSheet.textContent = style;
      document.head.appendChild(styleSheet);
    }
  }

  // Load data for visualization
  loadData(data) {
    this.data = data;
    this.render();
  }

  // Render the visualization
  render() {
    if (!this.data || !this.svg) {
      console.error('No data or SVG container available');
      return;
    }

    // Clear previous visualization
    this.svg.selectAll('*').remove();

    // Add title
    this.svg.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text('Human Impact of Equipment Downtime');

    // Set up dimensions
    const margin = { top: 60, right: 50, bottom: 100, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create main group
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for visualization
    const processedData = this.processData(this.data);

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.period))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.impactScore)])
      .range([height, 0]);

    // Add X axis
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add Y axis
    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale));

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Impact Score');

    // Add bars for impact scores
    g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.period))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.impactScore))
      .attr('height', d => height - yScale(d.impactScore))
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());

    // Add impact line (trend)
    const line = d3.line()
      .x(d => xScale(d.period) + xScale.bandwidth() / 2)
      .y(d => yScale(d.impactScore))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(processedData)
      .attr('class', 'impact-line')
      .attr('d', line);

    // Add impact points
    g.selectAll('.impact-point')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'impact-point')
      .attr('cx', d => xScale(d.period) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.impactScore))
      .attr('r', 5)
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());

    // Add value labels on bars
    g.selectAll('.impact-label')
      .data(processedData)
      .enter()
      .append('text')
      .attr('class', 'impact-label')
      .attr('x', d => xScale(d.period) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.impactScore) - 5)
      .text(d => d3.format('.1f')(d.impactScore));

    // Add legend
    this.addLegend(g, width);
  }

  // Process raw data for visualization
  processData(rawData) {
    // This would transform the raw impact data into the format needed for visualization
    // For now, we'll create a sample transformation
    return rawData.map((item, index) => ({
      period: `Period ${index + 1}`,
      impactScore: item.impactScore || Math.random() * 100,
      affectedEmployees: item.affectedEmployees || Math.floor(Math.random() * 50),
      downtimeHours: item.downtimeHours || Math.random() * 24,
      cost: item.cost || Math.random() * 10000
    }));
  }

  // Add legend to the visualization
  addLegend(g, width) {
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`);

    // Bar color legend
    legend.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', 'steelblue');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 15)
      .text('Impact Level');

    // Line color legend
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 30)
      .attr('x2', 20)
      .attr('y2', 30)
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 35)
      .text('Trend');
  }

  // Show tooltip on hover
  showTooltip(event, data) {
    // Remove existing tooltip
    d3.select('.tooltip').remove();

    // Create new tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 1)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      .html(`
        <strong>Period:</strong> ${data.period}<br/>
        <strong>Impact Score:</strong> ${data.impactScore.toFixed(2)}<br/>
        <strong>Affected Employees:</strong> ${data.affectedEmployees}<br/>
        <strong>Downtime Hours:</strong> ${data.downtimeHours.toFixed(2)}<br/>
        <strong>Cost:</strong> $${data.cost.toFixed(2)}
      `);
  }

  // Hide tooltip
  hideTooltip() {
    d3.select('.tooltip').remove();
  }

  // Update visualization with new data
  updateData(newData) {
    this.data = newData;
    this.render();
  }

  // Create a narrative visualization
  createNarrativeVisualization(narrativeData) {
    if (!this.svg) {
      console.error('SVG container not initialized');
      return;
    }

    // Clear existing content
    this.svg.selectAll('*').remove();

    // Add title
    this.svg.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text('Human Impact Narrative');

    // Create a story-based visualization
    const storyContainer = this.svg.append('g')
      .attr('transform', 'translate(50, 60)');

    // Add narrative elements
    narrativeData.forEach((story, index) => {
      const yPosition = index * 100;
      
      // Add story title
      storyContainer.append('text')
        .attr('x', 0)
        .attr('y', yPosition)
        .attr('class', 'impact-label')
        .style('font-weight', 'bold')
        .text(story.title);

      // Add story description
      storyContainer.append('text')
        .attr('x', 0)
        .attr('y', yPosition + 20)
        .attr('class', 'impact-label')
        .style('font-size', '14px')
        .text(story.description);

      // Add impact metrics
      storyContainer.append('text')
        .attr('x', 0)
        .attr('y', yPosition + 40)
        .attr('class', 'impact-label')
        .style('font-size', '12px')
        .text(`Impact Score: ${story.impactScore} | Affected People: ${story.affectedCount} | Duration: ${story.duration}`);
    });
  }

  // Create a 3D-like visualization using layered elements
  create3DVisualization(data) {
    if (!this.svg) {
      console.error('SVG container not initialized');
      return;
    }

    // Clear existing content
    this.svg.selectAll('*').remove();

    // Add title
    this.svg.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text('3D Human Impact Visualization');

    const container = this.svg.append('g')
      .attr('transform', 'translate(100, 50)');

    // Create a 3D-like effect with layered bars
    data.forEach((item, index) => {
      const barHeight = item.impactScore * 3; // Scale factor
      const offset = index * 20; // Depth effect

      // Shadow layer
      container.append('rect')
        .attr('x', index * 50)
        .attr('y', 300 - barHeight + offset)
        .attr('width', 30)
        .attr('height', barHeight)
        .attr('fill', 'rgba(0, 0, 0, 0.2)')
        .attr('transform', `translate(5, 5)`);

      // Main bar
      container.append('rect')
        .attr('x', index * 50)
        .attr('y', 300 - barHeight + offset)
        .attr('width', 30)
        .attr('height', barHeight)
        .attr('fill', this.getImpactColor(item.impactScore))
        .on('mouseover', (event, d) => this.showTooltip(event, item))
        .on('mouseout', () => this.hideTooltip());

      // Add label
      container.append('text')
        .attr('x', index * 50 + 15)
        .attr('y', 320)
        .attr('text-anchor', 'middle')
        .attr('class', 'impact-label')
        .text(item.period);
    });
  }

  // Get color based on impact score
  getImpactColor(score) {
    if (score < 30) return '#2ecc71'; // Low impact - green
    if (score < 60) return '#f39c12'; // Medium impact - orange
    if (score < 80) return '#e67e22'; // High impact - dark orange
    return '#e74c3c'; // Critical impact - red
  }
}

// Export the visualizer
export default HumanImpactVisualizer;