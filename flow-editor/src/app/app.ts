import { Component, AfterViewInit, inject } from '@angular/core';
import { VanillaFlowService, FlowNode, FlowLink } from './vanilla-flow.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  private flowService = inject(VanillaFlowService);

  ngAfterViewInit() {
    // Initialize the graph
    // We assume the window size for now, or get the container size
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.flowService.initialize('#d3-graph', '#d3-minimap', width, height);

    // Create example nodes with stacked sections
    const nodes: FlowNode[] = [
      {
        id: '1',
        x: 100, y: 100, width: 200, height: 150,
        label: 'Data Source',
        sections: [
          { id: 's1', text: 'Fetch Data', icon: '📡', ports: 'right' },
          { id: 's2', text: 'Validate', icon: '✅', ports: 'right' }
        ]
      },
      {
        id: '2',
        x: 450, y: 150, width: 220, height: 180,
        label: 'Processing Unit',
        sections: [
          { id: 'in', text: 'Input Stream', icon: '📥', ports: 'left' },
          { id: 'proc', text: 'Transform', icon: '⚙️', ports: 'none' },
          { id: 'out1', text: 'Success Output', icon: '📤', ports: 'right' },
          { id: 'out2', text: 'Error Output', icon: '⚠️', ports: 'right' }
        ]
      },
      {
        id: '3',
        x: 800, y: 100, width: 200, height: 100,
        label: 'Log Storage',
        sections: [
          { id: 'main', text: 'Write Logs', icon: '💾', ports: 'left' }
        ]
      },
      {
        id: '4',
        x: 800, y: 300, width: 200, height: 100,
        label: 'Alert System',
        sections: [
          { id: 'main', text: 'Send Alert', icon: '🔔', ports: 'left' }
        ]
      }
    ];

    // Create connections linking specific sections
    const links: FlowLink[] = [
      { source: '1', sourceHandle: '1-s1-right', target: '2', targetHandle: '2-in-left' },
      { source: '2', sourceHandle: '2-out1-right', target: '3', targetHandle: '3-main-left' },
      { source: '2', sourceHandle: '2-out2-right', target: '4', targetHandle: '4-main-left' }
    ];

    this.flowService.setData(nodes, links);
  }
}
