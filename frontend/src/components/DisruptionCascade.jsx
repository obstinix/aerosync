import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import useStore from '../store/useStore';

/**
 * DisruptionCascade — D3 force-directed graph that renders a "butterfly effect"
 * visualization of how a disruption event at one hub cascades across the network.
 *
 * Props:
 *  - cascadeData: { airport, severity, affectedFlights: string[], totalDelay }
 *    If null/undefined, renders an empty placeholder.
 */
export default function DisruptionCascade({ cascadeData }) {
  const svgRef = useRef(null);
  const flights = useStore((s) => s.flights);

  const ACCENT = '#00D4FF';
  const RED = '#FF3D5A';
  const AMBER = '#FFB800';
  const MUTED = '#555';
  const BG = '#0d0d0d';

  // Build graph data from cascade
  const graphData = useMemo(() => {
    if (!cascadeData || !cascadeData.affectedFlights || cascadeData.affectedFlights.length === 0) {
      return null;
    }

    const nodes = [];
    const links = [];

    // Source node: the airport where disruption originated
    nodes.push({
      id: cascadeData.airport,
      type: 'hub',
      radius: 18,
      color: RED,
      label: cascadeData.airport,
    });

    // Affected flight nodes
    const affectedSet = new Set(cascadeData.affectedFlights);
    const affectedFlightObjects = flights.filter(f =>
      affectedSet.has(f.id) || affectedSet.has(f.flightNumber)
    );

    // Fallback: if we can't match flight objects, use IDs directly
    const flightNodes = affectedFlightObjects.length > 0
      ? affectedFlightObjects
      : cascadeData.affectedFlights.map(id => ({ id, origin: cascadeData.airport, destination: '???', status: 'delayed' }));

    flightNodes.forEach((flight, i) => {
      const delayEstimate = Math.floor(cascadeData.severity * (8 + i * 3));
      nodes.push({
        id: flight.id || flight.flightNumber || `F-${i}`,
        type: 'flight',
        radius: 8 + Math.min(delayEstimate / 10, 8),
        color: delayEstimate > 60 ? RED : delayEstimate > 30 ? AMBER : ACCENT,
        label: flight.id || flight.flightNumber || `F-${i}`,
        delay: delayEstimate,
        destination: flight.destination,
      });

      links.push({
        source: cascadeData.airport,
        target: flight.id || flight.flightNumber || `F-${i}`,
        strength: Math.min(cascadeData.severity / 10, 1),
      });

      // Secondary cascade: connect affected flights to their destinations
      if (flight.destination && flight.destination !== cascadeData.airport) {
        const destId = `${flight.destination}-dest`;
        if (!nodes.find(n => n.id === destId)) {
          nodes.push({
            id: destId,
            type: 'secondary-hub',
            radius: 10,
            color: AMBER,
            label: flight.destination,
          });
        }
        links.push({
          source: flight.id || flight.flightNumber || `F-${i}`,
          target: destId,
          strength: 0.3,
        });
      }
    });

    return { nodes, links };
  }, [cascadeData, flights]);

  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 400;

    // Defs for glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial gradient for hub node
    const hubGrad = defs.append('radialGradient').attr('id', 'hub-grad');
    hubGrad.append('stop').attr('offset', '0%').attr('stop-color', RED).attr('stop-opacity', 0.9);
    hubGrad.append('stop').attr('offset', '100%').attr('stop-color', RED).attr('stop-opacity', 0.2);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(80).strength(d => d.strength || 0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 8));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', d => {
        const targetNode = graphData.nodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
        return targetNode ? targetNode.color : MUTED;
      })
      .attr('stroke-opacity', 0)
      .attr('stroke-width', d => 1 + d.strength * 2)
      .attr('stroke-dasharray', '4 2');

    // Animate links appearing
    link.transition()
      .delay((d, i) => 200 + i * 100)
      .duration(600)
      .attr('stroke-opacity', 0.4);

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Pulse ring for hub node
    node.filter(d => d.type === 'hub')
      .append('circle')
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', RED)
      .attr('stroke-width', 2)
      .transition()
      .delay(300)
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('r', 40)
      .attr('stroke-opacity', 0)
      .on('end', function repeat() {
        d3.select(this)
          .attr('r', 0)
          .attr('stroke-opacity', 0.8)
          .transition()
          .duration(1500)
          .ease(d3.easeCubicOut)
          .attr('r', 40)
          .attr('stroke-opacity', 0)
          .on('end', repeat);
      });

    // Main circles with entrance animation
    node.append('circle')
      .attr('r', 0)
      .attr('fill', d => d.type === 'hub' ? 'url(#hub-grad)' : d.color)
      .attr('fill-opacity', d => d.type === 'hub' ? 1 : 0.85)
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.type === 'hub' ? 2 : 1)
      .style('filter', d => d.type === 'hub' ? 'url(#glow)' : 'none')
      .transition()
      .delay((d, i) => i * 80)
      .duration(500)
      .ease(d3.easeBackOut)
      .attr('r', d => d.radius);

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('dy', d => d.radius + 14)
      .attr('text-anchor', 'middle')
      .style('font-family', '"JetBrains Mono", monospace')
      .style('font-size', d => d.type === 'hub' ? '11px' : '9px')
      .style('fill', d => d.type === 'hub' ? '#F5F5F5' : MUTED)
      .style('font-weight', d => d.type === 'hub' ? '700' : '400')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => 400 + i * 80)
      .duration(300)
      .style('opacity', 1);

    // Delay labels for flight nodes
    node.filter(d => d.type === 'flight' && d.delay)
      .append('text')
      .text(d => `+${d.delay}m`)
      .attr('dy', d => -d.radius - 6)
      .attr('text-anchor', 'middle')
      .style('font-family', '"JetBrains Mono", monospace')
      .style('font-size', '8px')
      .style('fill', d => d.delay > 60 ? RED : d.delay > 30 ? AMBER : ACCENT)
      .style('font-weight', '600')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => 600 + i * 80)
      .duration(300)
      .style('opacity', 1);

    // Tick handler
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  if (!cascadeData || !graphData) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-data)',
        fontSize: 'var(--text-xs)',
        color: MUTED,
        gap: 'var(--space-2)',
        background: BG,
        borderRadius: 'var(--r-lg)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '32px', opacity: 0.3 }}>🦋</div>
        <div>INJECT A DISRUPTION TO VISUALIZE CASCADE</div>
        <div style={{ fontSize: '9px', opacity: 0.5 }}>Force-directed graph powered by D3</div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      background: BG,
      borderRadius: 'var(--r-lg)',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Title overlay */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 16,
        zIndex: 10,
        fontFamily: 'var(--font-display)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#F5F5F5',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: '16px' }}>🦋</span> DISRUPTION CASCADE
      </div>

      {/* Legend overlay */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 16,
        zIndex: 10,
        display: 'flex',
        gap: 12,
        fontFamily: 'var(--font-data)',
        fontSize: '9px',
        color: MUTED,
      }}>
        <span><span style={{ color: RED }}>●</span> Critical (&gt;60m)</span>
        <span><span style={{ color: AMBER }}>●</span> Moderate (30-60m)</span>
        <span><span style={{ color: ACCENT }}>●</span> Minor (&lt;30m)</span>
      </div>

      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
