// Advanced Visualization Component for Human Impact
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import MonteCarloSimulator from '../../services/simulation/monteCarloSimulator';
import EquipmentPredictor from '../../services/prediction/equipmentPredictor';

const AdvancedVisualization = ({ equipmentData, impactData }) => {
  const svgRef = useRef();
  const [visualizationData, setVisualizationData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize visualization
  useEffect(() => {
    if (equipmentData && impactData) {
      createVisualization();
    }
  }, [equipmentData, impactData]);

  const createVisualization = async () => {
    setLoading(true);

    try {
      // Process data for visualization
      const processedData = processData();
      setVisualizationData(processedData);

      // Create D3 visualization
      await renderD3Visualization(processedData);
    } catch (error) {
      console.error('Error creating visualization:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = () => {
    // Transform the equipment and impact data into visualization format
    if (!equipmentData || !impactData) return [];

    return impactData.map((impact, index) => ({
      period: `Period ${index + 1}`,
      impactScore: impact.human_impact_score || 0,
      affectedEmployees: impact.affected_employees || 0,
      downtimeHours: impact.downtime_hours || 0,
      cost: impact.cost_calculated || 0,
      equipmentName: equipmentData.name || `Equipment ${index + 1}`
    }));
  };

  const renderD3Visualization = async (data) => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous visualization

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.period))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.impactScore, d.downtimeHours)) * 1.1])
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Impact Score / Downtime (hrs)');

    // Add bars for impact scores
    g.selectAll('.impact-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'impact-bar')
      .attr('x', d => xScale(d.period))
      .attr('y', d => yScale(d.impactScore))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.impactScore))
      .attr('fill', d => getImpactColor(d.impactScore))
      .on('mouseover', (event, d) => showTooltip(event, d))
      .on('mouseout', hideTooltip);

    // Add line for downtime hours
    const line = d3.line()
      .x(d => xScale(d.period) + xScale.bandwidth() / 2)
      .y(d => yScale(d.downtimeHours))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('class', 'downtime-line')
      .attr('fill', 'none')
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add circles for downtime data points
    g.selectAll('.downtime-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'downtime-point')
      .attr('cx', d => xScale(d.period) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.downtimeHours))
      .attr('r', 5)
      .attr('fill', '#e74c3c')
      .on('mouseover', (event, d) => showTooltip(event, d))
      .on('mouseout', hideTooltip);

    // Add CSS styles
    addStyles();
  };

  const getImpactColor = (score) => {
    if (score < 30) return '#2ecc71'; // Low impact - green
    if (score < 60) return '#f39c12'; // Medium impact - orange
    if (score < 80) return '#e67e22'; // High impact - dark orange
    return '#e74c3c'; // Critical impact - red
  };

  const addStyles = () => {
    // Add styles to the document if they don't exist
    if (!document.querySelector('#advanced-viz-styles')) {
      const style = document.createElement('style');
      style.id = 'advanced-viz-styles';
      style.textContent = `
        .impact-bar {
          transition: fill 0.3s;
        }
        
        .impact-bar:hover {
          fill: #c0392b !important;
        }
        
        .downtime-line {
          transition: stroke 0.3s;
        }
        
        .downtime-point {
          transition: r 0.3s;
        }
        
        .downtime-point:hover {
          r: 7;
        }
        
        .x-axis path,
        .x-axis line,
        .y-axis path,
        .y-axis line {
          stroke: #333;
        }
        
        .x-axis text,
        .y-axis text {
          font-size: 12px;
          fill: #333;
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
          z-index: 1000;
        }
      `;
      document.head.appendChild(style);
    }
  };

  const showTooltip = (event, data) => {
    // Remove existing tooltip
    d3.selectAll('.tooltip').remove();

    // Create new tooltip
    d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 1)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      .html(`
        <strong>${data.equipmentName}</strong><br/>
        <strong>Period:</strong> ${data.period}<br/>
        <strong>Impact Score:</strong> ${data.impactScore.toFixed(2)}<br/>
        <strong>Downtime Hours:</strong> ${data.downtimeHours.toFixed(2)}<br/>
        <strong>Affected Employees:</strong> ${data.affectedEmployees}<br/>
        <strong>Cost:</strong> $${data.cost.toFixed(2)}
      `);
  };

  const hideTooltip = () => {
    d3.selectAll('.tooltip').remove();
  };

  // Run Monte Carlo simulation
  const runMonteCarloSimulation = async () => {
    if (!equipmentData) return;

    setLoading(true);
    try {
      // Prepare base parameters for simulation
      const baseParams = {
        revenuePerHour: equipmentData.value ? equipmentData.value * 0.0001 : 1000,
        affectedEmployees: Math.max(1, Math.round(equipmentData.criticality * 2)),
        hourlyWage: 50,
        equipmentValue: equipmentData.value || 0
      };

      // Run simulation with 10 hours downtime
      const results = await MonteCarloSimulator.runSimulation(10, baseParams);

      // Process and display results
      console.log('Monte Carlo Simulation Results:', results);

      // You could update the visualization with simulation results here
      // For now, we'll just log the results
    } catch (error) {
      console.error('Error running Monte Carlo simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run predictive analysis
  const runPredictiveAnalysis = async () => {
    if (!equipmentData) return;

    setLoading(true);
    try {
      // Get predictive analysis
      const analysis = await EquipmentPredictor.analyzeFailurePatterns(equipmentData.id);
      console.log('Predictive Analysis Results:', analysis);

      // You could update the visualization with prediction results here
    } catch (error) {
      console.error('Error running predictive analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-visualization">
      <h3>Advanced Human Impact Visualization</h3>

      <div className="visualization-controls">
        <button onClick={runMonteCarloSimulation} disabled={loading}>
          {loading ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
        </button>
        <button onClick={runPredictiveAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Predictive Analysis'}
        </button>
      </div>

      {loading && <div className="loading">Processing data...</div>}

      <svg
        ref={svgRef}
        width="100%"
        height="500px"
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid meet"
      />

      {visualizationData && (
        <div className="visualization-data">
          <h4>Impact Summary</h4>
          <ul>
            {visualizationData.map((item, index) => (
              <li key={index}>
                <strong>{item.period}:</strong> Impact Score: {item.impactScore},
                Downtime: {item.downtimeHours} hrs,
                Affected: {item.affectedEmployees} employees
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdvancedVisualization;