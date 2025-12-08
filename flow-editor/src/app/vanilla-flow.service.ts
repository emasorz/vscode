import { Injectable } from '@angular/core';

import { Type } from '@angular/core';

export type NodePortType = 'left' | 'right' | 'both' | 'none';

export interface NodeSection {
	id: string; // unique within the node at least
	text: string;
	icon?: string; // string for now, could be url or class
	ports: NodePortType;
}

export interface FlowNode {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label?: string;
	component?: Type<any>;
	data?: any;
	content?: string; // HTML content (legacy/custom)
	sections?: NodeSection[];
}

export interface FlowLink {
	id?: string;
	source: string;
	sourceHandle?: string;
	target: string;
	targetHandle?: string;
}

@Injectable({
	providedIn: 'root'
})
export class VanillaFlowService {
	private container: HTMLElement | null = null;
	private world: HTMLElement | null = null; // The transforming layer
	private svgLayer: SVGSVGElement | null = null; // For links

	private minimapContainer: HTMLElement | null = null;
	private minimapSvg: SVGSVGElement | null = null;

	private nodes: FlowNode[] = [];
	private links: FlowLink[] = [];
	private nodeMap = new Map<string, FlowNode>();
	private nodeElements = new Map<string, HTMLElement>();
	private linkElements = new Map<string, SVGPathElement>();

	// Transform state
	private transform = { x: 0, y: 0, k: 1 };
	private isDraggingWorld = false;
	private isDraggingNode = false;
	private draggedNodeId: string | null = null;

	private lastMousePos = { x: 0, y: 0 };

	// Linking State
	private isLinking = false;
	private linkingSourceId: string | null = null;
	private linkingSourceHandle: string | null = null;
	private draftLinkPath: SVGPathElement | null = null;

	private minimapScale = 0.2;

	initialize(containerId: string, minimapId: string, width: number, height: number) {
		this.container = document.querySelector(containerId);
		this.minimapContainer = document.querySelector(minimapId);

		if (!this.container) throw new Error(`Container ${containerId} not found`);

		// styling container
		this.container.style.overflow = 'hidden';
		this.container.style.position = 'relative';
		this.container.style.backgroundColor = 'transparent'; // Allow parent CSS background to show
		this.container.style.cursor = 'grab';

		// Create World (wrapper for nodes and links)
		this.world = document.createElement('div');
		this.world.style.position = 'absolute';
		this.world.style.width = '0';
		this.world.style.height = '0';
		this.world.style.top = '0';
		this.world.style.left = '0';
		this.world.style.transformOrigin = '0 0';
		this.world.style.willChange = 'transform';
		this.world.style.zIndex = '10'; // Above background effects
		this.container.appendChild(this.world);

		// Create SVG Layer for Line connections (inside world)
		this.svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svgLayer.style.marginTop = '-50000px';
		this.svgLayer.style.marginLeft = '-50000px';
		this.svgLayer.style.width = '100000px';
		this.svgLayer.style.height = '100000px';
		this.svgLayer.style.position = 'absolute';
		this.svgLayer.style.overflow = 'visible';
		this.svgLayer.style.pointerEvents = 'none'; // Click through lines
		this.world.appendChild(this.svgLayer);

		// Setup Event Listeners
		this.setupEvents();

		// Setup Minimap
		if (this.minimapContainer) {
			this.minimapSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			this.minimapSvg.style.width = '100%';
			this.minimapSvg.style.height = '100%';
			this.minimapSvg.style.backgroundColor = '#252526';
			this.minimapContainer.appendChild(this.minimapSvg);
		}
	}

	setData(nodes: FlowNode[], links: FlowLink[]) {
		this.nodes = nodes;
		this.links = links;
		this.nodeMap = new Map(nodes.map(n => [n.id, n]));

		this.render();
		this.updateTransform();
	}

	private render() {
		if (!this.world || !this.svgLayer) return;

		// Clear previous
		const children = Array.from(this.world.children);
		children.forEach(c => {
			if (c !== this.svgLayer) this.world?.removeChild(c);
		});
		this.svgLayer.innerHTML = ''; // Clear links
		this.nodeElements.clear();
		this.linkElements.clear();

		const OFFSET = 50000;

		// Render Links
		this.links.forEach((link, index) => {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('stroke', '#555');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('fill', 'none');
			this.svgLayer?.appendChild(path);

			// Unique key for each link instance to allow multiple connections
			const key = link.id || `${link.source}:${link.sourceHandle || ''}-${link.target}:${link.targetHandle || ''}-${index}`;
			this.linkElements.set(key, path);
		});

		// Render Nodes
		this.nodes.forEach(node => {
			const el = document.createElement('div');
			el.style.position = 'absolute';
			el.style.width = `${node.width}px`;
			el.style.height = `${node.height}px`;
			// Initial pos
			el.style.left = `${node.x}px`;
			el.style.top = `${node.y}px`;
			el.setAttribute('data-id', node.id);

			// Build Content (Sections vs Custom HTML)
			if (node.sections && node.sections.length > 0) {
				const container = document.createElement('div');
				container.style.display = 'flex';
				container.style.flexDirection = 'column';
				// Allow content to determine height
				container.style.height = 'auto';
				el.style.height = 'auto'; // Override fixed height for stacked nodes

				// container.classList.add('glass-node');
				container.style.background = '#42424220'; // Removed for glass class
				container.style.borderRadius = '6px';
				container.style.backdropFilter = 'blur(10px)';
				container.style.border = '1px solid #555555a0';
				container.style.color = '#fff';
				// Remove overflow hidden so ports (negative positioning) are visible
				container.style.overflow = 'visible';
				container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'; // Removed for glass class

				// Header (optional label)
				if (node.label) {
					const header = document.createElement('div');
					header.classList.add('glass-header');
					// header.style.background = '#eee'; // Removed
					header.style.padding = '8px';
					header.style.fontWeight = 'bold';
					// header.style.borderBottom = '1px solid #ddd'; // Removed
					header.textContent = node.label;
					container.appendChild(header);
				}

				node.sections.forEach(section => {
					const row = document.createElement('div');
					row.classList.add('glass-row');
					row.style.position = 'relative';
					row.style.display = 'flex';
					row.style.alignItems = 'center';
					row.style.padding = '8px 12px';
					// row.style.borderBottom = '1px solid #f0f0f0'; // Removed
					row.style.minHeight = '20px';

					// Icon
					if (section.icon) {
						const icon = document.createElement('span');
						icon.style.marginRight = '8px';
						icon.textContent = section.icon; // Assuming emoji or simplistic icon for now
						row.appendChild(icon);
					}

					// Text
					const text = document.createElement('span');
					text.textContent = section.text;
					text.style.flex = '1';
					row.appendChild(text);

					// Ports
					const createPort = (type: 'left' | 'right') => {
						const port = document.createElement('div');
						port.setAttribute('data-port-id', `${node.id}-${section.id}-${type}`);
						port.setAttribute('data-port-node-id', node.id); // For linking source identification
						// Styles
						Object.assign(port.style, {
							position: 'absolute',
							width: '10px',
							height: '10px',
							borderRadius: '50%',
							background: '#555',
							border: '1px solid #fff',
							[type]: '-5px',
							top: 'calc(50% - 5px)',
							cursor: 'crosshair',
							zIndex: '10'
						});
						port.addEventListener('mouseenter', () => port.style.background = '#2196f3');
						port.addEventListener('mouseleave', () => port.style.background = '#555');
						return port;
					};

					if (section.ports === 'left' || section.ports === 'both') {
						row.appendChild(createPort('left'));
					}
					if (section.ports === 'right' || section.ports === 'both') {
						row.appendChild(createPort('right'));
					}

					container.appendChild(row);
				});
				el.appendChild(container);

				// Auto-height adjustment if not dragging (initial render)
				// Note: this is tricky with absolute positioning, we might trust CSS or user provided height
			} else {
				// Legacy content
				el.innerHTML = `<div class="custom-node" style="width:100%; height:100%; overflow:hidden;">${node.content}</div>`;

				// Add single default port for legacy nodes
				const port = document.createElement('div');
				port.classList.add('node-port');
				Object.assign(port.style, {
					position: 'absolute',
					width: '12px',
					height: '12px',
					borderRadius: '50%',
					backgroundColor: '#2196f3',
					border: '2px solid #fff',
					right: '-6px',
					top: 'calc(50% - 6px)',
					cursor: 'crosshair',
					zIndex: '10'
				});
				port.setAttribute('data-port-id', `${node.id}-default`);
				port.setAttribute('data-port-node-id', node.id);
				el.appendChild(port);
			}

			this.world?.appendChild(el);
			this.nodeElements.set(node.id, el);
		});

		this.updateLinkPositions();
	}

	// Public so App can force update if needed
	// Used by consumption to bind DOM elements after Angular renders them
	registerNode(id: string, element: HTMLElement) {
		this.nodeElements.set(id, element);
	}

	public updateLinkPositions() {
		const OFFSET = 50000;
		this.links.forEach((link, index) => {
			const s = this.nodeMap.get(link.source);
			const t = this.nodeMap.get(link.target);
			if (s && t) {
				const key = link.id || `${link.source}:${link.sourceHandle || ''}-${link.target}:${link.targetHandle || ''}-${index}`;
				const pathElement = this.linkElements.get(key);
				if (!pathElement) return;

				let sx: number, sy: number, tx: number, ty: number;
				const OFFSET = 50000;

				// Try to find specific handle elements
				const sourceEl = this.nodeElements.get(s.id);
				const targetEl = this.nodeElements.get(t.id);

				// Helper to get relative pos
				const getHandlePos = (nodeEl: HTMLElement, handleId: string | undefined): { x: number, y: number } | null => {
					if (!handleId) return null;
					const handle = nodeEl.querySelector(`[data-port-id="${handleId}"]`);
					if (handle) {
						// We need position relative to the node
						const hRect = handle.getBoundingClientRect();
						const nRect = nodeEl.getBoundingClientRect();
						return {
							x: ((hRect.left - nRect.left) + hRect.width / 2) / this.transform.k,
							y: ((hRect.top - nRect.top) + hRect.height / 2) / this.transform.k
						};
					}
					return null;
				};

				const sPos = getHandlePos(sourceEl!, link.sourceHandle);
				if (sPos) {
					sx = s.x + sPos.x + OFFSET;
					sy = s.y + sPos.y + OFFSET;
				} else {
					const h = sourceEl ? sourceEl.offsetHeight : s.height;
					sx = s.x + s.width + OFFSET;
					sy = s.y + h / 2 + OFFSET;
				}

				const tPos = getHandlePos(targetEl!, link.targetHandle);
				if (tPos) {
					tx = t.x + tPos.x + OFFSET;
					ty = t.y + tPos.y + OFFSET;
				} else {
					const h = targetEl ? targetEl.offsetHeight : t.height;
					tx = t.x + OFFSET; // Default to left side for target
					ty = t.y + h / 2 + OFFSET;
				}

				const d = `M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 50} ${ty}, ${tx} ${ty}`;
				pathElement.setAttribute('d', d);
			}
		});
	}

	private setupEvents() {
		if (!this.container) return;

		// Zoom
		this.container.addEventListener('wheel', (e) => {
			e.preventDefault();
			const zoomSensitivity = 0.001;
			const delta = -e.deltaY * zoomSensitivity;
			const scaleChange = Math.exp(delta); // Smoother exponential zoom
			const newScale = Math.min(Math.max(0.1, this.transform.k * scaleChange), 4);

			// Zoom towards cursor
			const rect = this.container!.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Calculate point in world space before zoom
			const worldX = (mouseX - this.transform.x) / this.transform.k;
			const worldY = (mouseY - this.transform.y) / this.transform.k;

			// Update Scale
			this.transform.k = newScale;

			// Recalculate translation to keep world point under mouse
			this.transform.x = mouseX - worldX * this.transform.k;
			this.transform.y = mouseY - worldY * this.transform.k;

			this.updateTransform();
		}, { passive: false });

		// Pan & Drag Start
		this.container.addEventListener('mousedown', (e) => {
			const target = e.target as HTMLElement;

			// Check for Port Click for linking
			const portEl = target.closest('[data-port-id]') as HTMLElement;
			if (portEl) {
				const nodeId = portEl.getAttribute('data-port-node-id');
				const portId = portEl.getAttribute('data-port-id');
				if (nodeId && portId) {
					this.isLinking = true;
					this.linkingSourceId = nodeId;
					this.linkingSourceHandle = portId;
					e.stopPropagation();
					e.preventDefault();

					// Create draft link
					this.draftLinkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					this.draftLinkPath.setAttribute('stroke', '#2196f3');
					this.draftLinkPath.setAttribute('stroke-width', '2');
					this.draftLinkPath.setAttribute('stroke-dasharray', '5,5');
					this.draftLinkPath.setAttribute('fill', 'none');
					this.svgLayer?.appendChild(this.draftLinkPath);
					return;
				}
			}

			const nodeEl = target.closest('[data-id]') as HTMLElement;

			this.lastMousePos = { x: e.clientX, y: e.clientY };

			if (nodeEl) {
				this.isDraggingNode = true;
				this.draggedNodeId = nodeEl.dataset['id'] || null;
				nodeEl.style.cursor = 'grabbing';
				e.stopPropagation(); // prevent pan logic
			} else {
				this.isDraggingWorld = true;
				this.container!.style.cursor = 'grabbing';
			}
		});

		// Move
		window.addEventListener('mousemove', (e) => {
			if (this.isLinking && this.draftLinkPath && this.linkingSourceId) {
				// Draw draft line
				const rect = this.container!.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				// Calculate Source Position
				const OFFSET = 50000;
				const s = this.nodeMap.get(this.linkingSourceId);
				const sEl = this.nodeElements.get(this.linkingSourceId);

				if (s && sEl) {
					const h = sEl.offsetHeight || s.height;
					let sx = s.x + s.width + OFFSET;
					let sy = s.y + h / 2 + OFFSET;

					// If we have a specific handle, use its pos
					if (this.linkingSourceHandle) {
						const handle = sEl.querySelector(`[data-port-id="${this.linkingSourceHandle}"]`);
						if (handle) {
							const hRect = handle.getBoundingClientRect();
							const nRect = sEl.getBoundingClientRect();
							const relX = ((hRect.left - nRect.left) + hRect.width / 2) / this.transform.k;
							const relY = ((hRect.top - nRect.top) + hRect.height / 2) / this.transform.k;
							sx = s.x + relX + OFFSET;
							sy = s.y + relY + OFFSET;
						}
					}

					// Target (Mouse) point transformed to World Space -> then to SVG Space
					const worldMouseX = (mouseX - this.transform.x) / this.transform.k;
					const worldMouseY = (mouseY - this.transform.y) / this.transform.k;

					const tx = worldMouseX + OFFSET;
					const ty = worldMouseY + OFFSET;

					const d = `M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 50} ${ty}, ${tx} ${ty}`;
					this.draftLinkPath.setAttribute('d', d);
				}
			}
			else if (this.isDraggingWorld) {
				const dx = e.clientX - this.lastMousePos.x;
				const dy = e.clientY - this.lastMousePos.y;
				this.transform.x += dx;
				this.transform.y += dy;
				this.lastMousePos = { x: e.clientX, y: e.clientY };
				this.updateTransform();
			} else if (this.isDraggingNode && this.draggedNodeId) {
				const dx = (e.clientX - this.lastMousePos.x) / this.transform.k; // Account for zoom
				const dy = (e.clientY - this.lastMousePos.y) / this.transform.k;

				const node = this.nodeMap.get(this.draggedNodeId);
				if (node) {
					node.x += dx;
					node.y += dy;

					// Update DOM directly for performance
					const el = this.nodeElements.get(this.draggedNodeId);
					if (el) {
						el.style.left = `${node.x}px`;
						el.style.top = `${node.y}px`;
					}

					this.updateLinkPositions(); // Re-render lines
					this.updateMinimap(); // Update rect in minimap
				}
				this.lastMousePos = { x: e.clientX, y: e.clientY };
			}
		});

		// End
		window.addEventListener('mouseup', (e) => {
			if (this.isLinking) {
				const target = e.target as HTMLElement;
				// Check if dropped on a PORT
				const portEl = target.closest('[data-port-id]') as HTMLElement;

				if (portEl) {
					const targetId = portEl.getAttribute('data-port-node-id');
					const targetHandle = portEl.getAttribute('data-port-id');

					if (targetId && targetHandle && targetId !== this.linkingSourceId) {
						// Logic handling
						// Prevent exact duplicates only
						const exists = this.links.some(l =>
							l.source === this.linkingSourceId &&
							l.sourceHandle === this.linkingSourceHandle &&
							l.target === targetId &&
							l.targetHandle === targetHandle
						);

						if (!exists) {
							this.links.push({
								source: this.linkingSourceId!,
								sourceHandle: this.linkingSourceHandle!,
								target: targetId,
								targetHandle: targetHandle
							});
							this.render(); // Force redraw to create new link element
						}
					}
				}

				// Cleanup draft
				if (this.draftLinkPath) {
					this.draftLinkPath.remove();
					this.draftLinkPath = null;
				}
				this.isLinking = false;
				this.linkingSourceId = null;
				this.linkingSourceHandle = null;
			}

			this.isDraggingWorld = false;
			this.isDraggingNode = false;
			this.container!.style.cursor = 'grab';
			if (this.draggedNodeId) {
				const el = this.nodeElements.get(this.draggedNodeId);
				if (el) el.style.cursor = 'grab';
				this.draggedNodeId = null;
			}
		});
	}

	private updateTransform() {
		if (!this.world) return;
		this.world.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.k})`;
		this.updateMinimapViewport();
	}

	// --- Minimap ---
	private renderMinimap() {
		if (!this.minimapSvg) return;
		this.minimapSvg.innerHTML = '';

		const scale = this.minimapScale;
		// Draw Nodes
		this.nodes.forEach(node => {
			const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('x', `${node.x * scale + 50}`); // Offset
			rect.setAttribute('y', `${node.y * scale + 50}`);
			rect.setAttribute('width', `${node.width * scale}`);
			rect.setAttribute('height', `${node.height * scale}`);
			rect.setAttribute('fill', '#007acc');
			this.minimapSvg?.appendChild(rect);
		});

		this.updateMinimapViewport();
	}

	private updateMinimap() {
		this.renderMinimap();
	}

	private updateMinimapViewport() {
		if (!this.minimapSvg || !this.container) return;

		// Cleanup old viewport rect
		const oldVw = this.minimapSvg.querySelector('.mm-viewport');
		if (oldVw) oldVw.remove();

		const containerRect = this.container.getBoundingClientRect();
		const scale = this.minimapScale;

		const vX = (-this.transform.x / this.transform.k) * scale + 50;
		const vY = (-this.transform.y / this.transform.k) * scale + 50;
		const vW = (containerRect.width / this.transform.k) * scale;
		const vH = (containerRect.height / this.transform.k) * scale;

		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rect.setAttribute('class', 'mm-viewport');
		rect.setAttribute('x', `${vX}`);
		rect.setAttribute('y', `${vY}`);
		rect.setAttribute('width', `${vW}`);
		rect.setAttribute('height', `${vH}`);
		rect.setAttribute('stroke', 'red');
		rect.setAttribute('stroke-width', '1');
		rect.setAttribute('fill', 'rgba(255, 0, 0, 0.1)');

		this.minimapSvg.appendChild(rect);
	}

	public addNode(node: FlowNode) {
		this.nodes.push(node);
		this.nodeMap.set(node.id, node);
		this.render();
		this.updateTransform();
		this.updateMinimap();
	}
}
