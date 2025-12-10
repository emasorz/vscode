/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IAccessibleViewInformationService } from '../../../services/accessibility/common/accessibleViewInformationService.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class FlowViewPane extends ViewPane {

	// 1. Dati SVG per la creazione manuale (omessi per brevità)

	private readonly iconData = new Map<string, Array<{ tag: string, attr: { [key: string]: string } }>>([
		// Core Logic
		['Service', [
			{ tag: 'circle', attr: { cx: '12', cy: '12', r: '3' } },
			{ tag: 'path', attr: { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' } }
		]],
		['Controller', [
			{ tag: 'line', attr: { x1: '4', y1: '21', x2: '4', y2: '14' } }, { tag: 'line', attr: { x1: '4', y1: '10', x2: '4', y2: '3' } },
			{ tag: 'line', attr: { x1: '12', y1: '21', x2: '12', y2: '12' } }, { tag: 'line', attr: { x1: '12', y1: '8', x2: '12', y2: '3' } },
			{ tag: 'line', attr: { x1: '20', y1: '21', x2: '20', y2: '16' } }, { tag: 'line', attr: { x1: '20', y1: '12', x2: '20', y2: '3' } },
			{ tag: 'line', attr: { x1: '1', y1: '14', x2: '7', y2: '14' } },
			{ tag: 'line', attr: { x1: '9', y1: '8', x2: '15', y2: '8' } },
			{ tag: 'line', attr: { x1: '17', y1: '16', x2: '23', y2: '16' } }
		]],
		['Middleware', [
			{ tag: 'polygon', attr: { points: '12 2 2 7 12 12 22 7 12 2' } },
			{ tag: 'polyline', attr: { points: '2 17 12 22 22 17' } },
			{ tag: 'polyline', attr: { points: '2 12 12 17 22 12' } }
		]],
		// Routing & UI
		['Route', [
			{ tag: 'circle', attr: { cx: '18', cy: '5', r: '3' } },
			{ tag: 'circle', attr: { cx: '6', cy: '12', r: '3' } },
			{ tag: 'circle', attr: { cx: '18', cy: '19', r: '3' } },
			{ tag: 'line', attr: { x1: '8.59', y1: '13.51', x2: '15.42', y2: '17.49' } },
			{ tag: 'line', attr: { x1: '15.41', y1: '6.51', x2: '8.59', y2: '10.49' } }
		]],
		['Component', [
			{ tag: 'path', attr: { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' } },
			{ tag: 'polyline', attr: { points: '3.27 6.96 12 12.01 20.73 6.96' } },
			{ tag: 'line', attr: { x1: '12', y1: '22.08', x2: '12', y2: '12' } }
		]],
		// Data & Storage (NEW)
		['Repository', [
			{ tag: 'path', attr: { d: 'M12 2v20M17 5H7M17 19H7M5 8h14M5 16h14' } } // Simboleggia uno stack di dati
		]],
		['Model', [
			{ tag: 'rect', attr: { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' } },
			{ tag: 'line', attr: { x1: '3', y1: '8', x2: '21', y2: '8' } },
			{ tag: 'line', attr: { x1: '3', y1: '13', x2: '21', y2: '13' } } // Simboleggia un documento o tabella
		]],
		// Integration (NEW)
		['Adapter', [
			{ tag: 'path', attr: { d: 'M5 12h14M12 5l7 7-7 7' } }, // Simboleggia un connettore o un'API
		]],
		['Guard', [
			{ tag: 'path', attr: { d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' } }, // Scudo
			{ tag: 'path', attr: { d: 'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' } }, // Buco della serratura (testa)
			{ tag: 'path', attr: { d: 'M12 13c-1.5 0-2.8.8-3.5 2h7c-.7-1.2-2-2-3.5-2z' } } // Buco della serratura (corpo)
		]],
		['Policy', [
			{ tag: 'path', attr: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' } }, // Documento
			{ tag: 'polyline', attr: { points: '14 2 14 8 20 8' } },
			{ tag: 'line', attr: { x1: '16', y1: '13', x2: '8', y2: '13' } },
			{ tag: 'line', attr: { x1: '16', y1: '17', x2: '8', y2: '17' } },
			{ tag: 'polyline', attr: { points: '10 9 9 9 8 9' } } // Checkmark o bullet
		]],

		// Event Driven & Async
		['Event', [
			{ tag: 'polygon', attr: { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' } } // Fulmine
		]],
		['Queue', [
			{ tag: 'rect', attr: { x: '2', y: '6', width: '20', height: '12', rx: '2' } }, // Contenitore
			{ tag: 'circle', attr: { cx: '6', cy: '12', r: '2' } },
			{ tag: 'circle', attr: { cx: '12', cy: '12', r: '2' } },
			{ tag: 'circle', attr: { cx: '18', cy: '12', r: '2' } }
		]],
		['Scheduler', [
			{ tag: 'circle', attr: { cx: '12', cy: '12', r: '10' } }, // Orologio
			{ tag: 'polyline', attr: { points: '12 6 12 12 16 14' } }
		]],

		// Utilities & Logic
		['Helper', [
			{ tag: 'path', attr: { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.77z' } } // Cacciavite/Chiave inglese stilizzata
		]],
		['Validator', [
			{ tag: 'path', attr: { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' } }, // Cerchio incompleto
			{ tag: 'polyline', attr: { points: '22 4 12 14.01 9 11.01' } } // Spunta di verifica
		]],
		['Mapper', [
			{ tag: 'circle', attr: { cx: '6', cy: '6', r: '3' } },
			{ tag: 'circle', attr: { cx: '6', cy: '18', r: '3' } },
			{ tag: 'circle', attr: { cx: '18', cy: '12', r: '3' } },
			{ tag: 'line', attr: { x1: '9', y1: '7.5', x2: '15', y2: '10.5' } }, // Freccia convergenza
			{ tag: 'line', attr: { x1: '9', y1: '16.5', x2: '15', y2: '13.5' } }
		]],

		// Infrastructure & External
		['Database', [
			{ tag: 'ellipse', attr: { cx: '12', cy: '5', rx: '9', ry: '3' } },
			{ tag: 'path', attr: { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' } },
			{ tag: 'path', attr: { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' } } // Cilindro DB
		]],
		['Cache', [
			{ tag: 'rect', attr: { x: '2', y: '4', width: '20', height: '16', rx: '2' } },
			{ tag: 'line', attr: { x1: '6', y1: '12', x2: '18', y2: '12' } },
			{ tag: 'line', attr: { x1: '6', y1: '8', x2: '18', y2: '8' } },
			{ tag: 'line', attr: { x1: '6', y1: '16', x2: '18', y2: '16' } }, // Rappresentazione "Memory stick"
			{ tag: 'path', attr: { d: 'M18 2L22 6' } } // Simbolo velocità/flash piccolo
		]],
		['Gateway', [
			{ tag: 'path', attr: { d: 'M12 2L2 7l10 5 10-5-10-5z' } }, // Layer sopra
			{ tag: 'path', attr: { d: 'M2 17l10 5 10-5' } }, // Layer sotto
			{ tag: 'path', attr: { d: 'M2 12l10 5 10-5' } } // Stack di layer (API Gateway)
		]],
	]);

	private readonly colorMap = new Map<string, string>([
		['Service', '#3794FF'], ['Controller', '#B388FF'], ['Middleware', '#FFCC66'],
		['Route', '#FF80AB'], ['Component', '#58B4A2'],
		['Repository', '#81C784'], ['Model', '#C5E1A5'],
		['Adapter', '#FF5733'], ['Guard', '#E57373'],      // Rosso chiaro
		['Policy', '#F06292'],     // Rosa carico
		['Event', '#FFD740'],      // Giallo/Oro
		['Queue', '#FFCA28'],      // Ambra
		['Scheduler', '#90A4AE'],  // Grigio Bluastro
		['Helper', '#4DD0E1'],     // Ciano
		['Validator', '#81D4FA'],  // Azzurro chiaro
		['Mapper', '#CE93D8'],     // Viola chiaro
		['Database', '#5C6BC0'],   // Indaco
		['Cache', '#26A69A'],      // Verde acqua scuro
		['Gateway', '#7E57C2'],    // Viola profondo
	]);

	private readonly descriptionMap = new Map<string, string>([
		['Service', 'Handles business logic, data access, and heavy computations.'],
		['Controller', 'Manages incoming requests and orchestrates the flow to services.'],
		['Middleware', 'Intercepts requests/responses for logging, authentication, or transformation.'],
		['Route', 'Defines the endpoint (URL) and directs requests to the correct controller.'],
		['Component', 'Represents a reusable UI block or a distinct functional unit.'],
		['Repository', 'Abstraction layer for data access (CRUD operations).'],
		['Model', 'Definition of data structure (entities, properties, schema).'],
		['Adapter', 'Converts interfaces to communicate with external systems or APIs.'],
		['Guard', 'Checks permissions and authorizes access to resources.'],
		['Policy', 'Defines rules and protocols for validation or security.'],
		['Event', 'Represents an asynchronous signal or message broadcast.'],
		['Queue', 'Buffers messages for asynchronous processing (FIFO/LIFO).'],
		['Scheduler', 'Executes tasks periodically (Cron jobs, timers).'],
		['Helper', 'Provides shared utility functions and stateless logic.'],
		['Validator', 'Ensures input data conforms to specific rules/schemas.'],
		['Mapper', 'Transforms data objects (e.g., Entity to DTO).'],
		['Database', 'Represents the physical storage system (SQL/NoSQL).'],
		['Cache', 'High-speed data storage layer (e.g., Redis).'],
		['Gateway', 'Entry point routing traffic to internal microservices.'],
	]);

	private readonly categorizedBlocks = new Map<string, string[]>([
		['Core Logic & Flow', ['Controller', 'Service', 'Middleware', 'Helper', 'Mapper']],
		['Security & Auth', ['Guard', 'Policy']],
		['Event Driven & Async', ['Event', 'Queue', 'Scheduler']],
		['Routing & UI', ['Route', 'Component', 'Gateway']],
		['Data & Storage', ['Model', 'Repository', 'Database', 'Cache']],
		['Integration', ['Adapter', 'Validator']],
	]);

	// Variabile per memorizzare i blocchi DOM creati
	private blockElements: HTMLElement[] = [];
	private categoryHeaders: HTMLElement[] = [];


	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IAccessibleViewInformationService accessibleViewService: IAccessibleViewInformationService
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService);
	}

	private createIconElement(name: string, color: string): SVGElement | null {
		// ... (Logica di createIconElement invariata)
		const iconSpecs = this.iconData.get(name);
		if (!iconSpecs) {
			return null;
		}

		const svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '16');
		svg.setAttribute('height', '16');
		svg.setAttribute('stroke', color);
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		svg.style.transition = 'opacity 0.1s, transform 0.1s';

		for (const spec of iconSpecs) {
			const element = document.createElementNS(SVG_NS, spec.tag);
			for (const key in spec.attr) {
				element.setAttribute(key, spec.attr[key]);
			}
			svg.appendChild(element);
		}

		return svg;
	}

	// NUOVA FUNZIONE: filtra i blocchi in base al testo di ricerca
	private filterBlocks(searchTerm: string): void {
		const query = searchTerm.toLowerCase().trim();

		// Contatore per tracciare i blocchi visibili per ogni categoria
		const visibleBlocksCount = new Map<string, number>();

		this.blockElements.forEach((item) => {
			const blockName = item.getAttribute('data-block-name') || '';
			const blockCategory = item.getAttribute('data-block-category') || '';

			// Cerca nel nome del blocco o nella sua descrizione
			const blockDescription = this.descriptionMap.get(blockName) || '';
			const match = blockName.toLowerCase().includes(query) || blockDescription.toLowerCase().includes(query);

			item.style.display = match ? 'flex' : 'none';

			if (match) {
				visibleBlocksCount.set(blockCategory, (visibleBlocksCount.get(blockCategory) || 0) + 1);
			}
		});

		// Nasconde le intestazioni delle categorie che non contengono blocchi visibili
		this.categoryHeaders.forEach((header) => {
			const categoryName = header.getAttribute('data-category-name') || '';

			// Nascondi l'intestazione se la query non è vuota E non ci sono blocchi visibili in quella categoria
			const shouldHide = query !== '' && (visibleBlocksCount.get(categoryName) === undefined || visibleBlocksCount.get(categoryName) === 0);

			// Nascondi l'intestazione solo se la ricerca è attiva E non ci sono risultati
			if (query !== '' && (visibleBlocksCount.get(categoryName) === undefined || visibleBlocksCount.get(categoryName) === 0)) {
				header.style.display = 'none';
			} else if (query === '') {
				// Se la ricerca è vuota, mostra tutte le intestazioni
				header.style.display = 'block';
			}
		});
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		// 1. Setup Container
		container.style.padding = '10px';
		container.style.overflowY = 'auto';

		// --- NEW: Aggiungi la searchbar ---
		const searchWrapper = document.createElement('div');
		searchWrapper.style.display = 'flex';
		searchWrapper.style.alignItems = 'center';
		searchWrapper.style.marginBottom = '10px';
		searchWrapper.style.position = 'relative'; // Necessario per posizionare l'icona

		// 2. Search Input
		const searchInput = document.createElement('input');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search blocks...';

		// Stili per integrarsi con VS Code
		searchInput.style.width = '100%';
		searchInput.style.padding = '5px 8px';

		// NEW: padding a sinistra per fare spazio all'icona (16px icona + 8px spazio)
		searchInput.style.paddingLeft = '32px';

		searchInput.style.border = '1px solid var(--vscode-input-border)';
		searchInput.style.backgroundColor = 'var(--vscode-input-background)';
		searchInput.style.color = 'var(--vscode-input-foreground)';
		searchInput.style.borderRadius = '2px';

		// 3. Icona di Ricerca
		const iconContainer = document.createElement('div');
		iconContainer.style.position = 'absolute';
		iconContainer.style.left = '8px'; // Sposta l'icona all'interno del campo
		iconContainer.style.zIndex = '1'; // Assicura che l'icona sia sopra l'input
		iconContainer.style.opacity = '0.7';

		// Utilizza il colore di primo piano dell'input
		const iconColor = 'var(--vscode-input-foreground)';
		const searchIcon = this.createSearchIcon(iconColor);
		iconContainer.appendChild(searchIcon);

		// Assembla il wrapper di ricerca
		searchWrapper.appendChild(iconContainer);
		searchWrapper.appendChild(searchInput);
		container.appendChild(searchWrapper);
		// ------------------------------------

		const listContainer = document.createElement('div');
		listContainer.style.display = 'flex';
		listContainer.style.flexDirection = 'column';
		listContainer.style.gap = '8px';

		container.appendChild(listContainer);

		// Reset liste di elementi DOM
		this.blockElements = [];
		this.categoryHeaders = [];

		// Cicla le categorie
		this.categorizedBlocks.forEach((blocks, categoryName) => {

			// Aggiungi l'intestazione della categoria
			const categoryHeader = document.createElement('h3');
			categoryHeader.textContent = categoryName;
			categoryHeader.setAttribute('data-category-name', categoryName); // Attributo per il filtro
			categoryHeader.style.fontSize = '0.9em';
			categoryHeader.style.margin = '10px 0 2px 0';
			categoryHeader.style.color = 'var(--vscode-list-foreground)';
			categoryHeader.style.opacity = '0.9';
			listContainer.appendChild(categoryHeader);
			this.categoryHeaders.push(categoryHeader);

			// Cicla i blocchi all'interno della categoria
			blocks.forEach(blockName => {
				const blockColor = this.colorMap.get(blockName) || 'var(--vscode-list-highlightForeground)';
				const blockDescription = this.descriptionMap.get(blockName) || '';

				const item = document.createElement('div');
				item.setAttribute('data-block-name', blockName);       // Attributo per il filtro
				item.setAttribute('data-block-category', categoryName); // Attributo per il filtro

				// Item Styles
				item.style.display = 'flex';
				item.style.justifyContent = 'space-between';
				item.style.alignItems = 'center';
				item.style.padding = '8px';
				item.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
				item.setAttribute('draggable', 'true');
				item.style.cursor = 'grab';
				item.style.borderRadius = '4px';
				item.style.color = 'var(--vscode-list-foreground)';
				item.style.border = `1px solid transparent`;
				item.style.transition = 'background-color 0.1s, border-color 0.1s, filter 0.1s';

				// Text Container (Name + Description)
				const textContainer = document.createElement('div');
				textContainer.style.display = 'flex';
				textContainer.style.flexDirection = 'column';
				textContainer.style.lineHeight = '1.3';
				textContainer.style.overflow = 'hidden';

				// Block Name
				const nameSpan = document.createElement('span');
				nameSpan.textContent = blockName;
				nameSpan.style.fontWeight = 'bold';
				textContainer.appendChild(nameSpan);

				// Block Description
				if (blockDescription) {
					const descSpan = document.createElement('span');
					descSpan.textContent = blockDescription;
					descSpan.style.fontSize = '0.85em';
					descSpan.style.opacity = '0.7';
					textContainer.appendChild(descSpan);
				}

				item.appendChild(textContainer);

				// Icon Element
				const iconDiv = document.createElement('div');
				iconDiv.style.flexShrink = '0';
				iconDiv.style.display = 'flex';
				iconDiv.style.opacity = '0.7';

				const svgElement = this.createIconElement(blockName, blockColor);
				if (svgElement) {
					iconDiv.appendChild(svgElement);
				}

				item.appendChild(iconDiv);

				// Events
				item.addEventListener('dragstart', (e) => {
					if (e.dataTransfer) {
						e.dataTransfer.setData('text/plain', blockName);
						e.dataTransfer.effectAllowed = 'copy';
					}
				});

				item.onmouseover = () => {
					item.style.backgroundColor = 'var(--vscode-list-activeSelectionBackground)';
					item.style.color = 'var(--vscode-list-activeSelectionForeground)';
					item.style.border = `1px solid ${blockColor}`;
					item.style.filter = `blur(0.5px)`;
					iconDiv.style.opacity = '1';
				};

				item.onmouseout = () => {
					item.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
					item.style.color = 'var(--vscode-list-foreground)';
					item.style.border = `1px solid transparent`;
					item.style.filter = `none`;
					iconDiv.style.opacity = '0.7';
				};

				listContainer.appendChild(item);
				this.blockElements.push(item); // Memorizza l'elemento per il filtro
			});
		});

		// --- NEW: Aggiungi l'event listener per il filtro ---
		searchInput.addEventListener('input', (e) => {
			this.filterBlocks(searchInput.value);
		});
		// ----------------------------------------------------
	}

	private createSearchIcon(color: string): SVGElement {
		const svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '16');
		svg.setAttribute('height', '16');
		svg.setAttribute('stroke', color);
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		svg.style.transition = 'color 0.1s';

		// Path per la lente di ingrandimento
		const circle = document.createElementNS(SVG_NS, 'circle');
		circle.setAttribute('cx', '11');
		circle.setAttribute('cy', '11');
		circle.setAttribute('r', '8');
		svg.appendChild(circle);

		const line = document.createElementNS(SVG_NS, 'line');
		line.setAttribute('x1', '21');
		line.setAttribute('y1', '21');
		line.setAttribute('x2', '16.65');
		line.setAttribute('y2', '16.65');
		svg.appendChild(line);

		return svg;
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
	}
}
