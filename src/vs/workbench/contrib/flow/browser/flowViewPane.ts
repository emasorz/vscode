/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
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

export class FlowViewPane extends ViewPane {

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

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		// Styles for the list
		container.style.padding = '10px';
		container.style.overflowY = 'auto';

		// Create a list of random blocks
		const blocks = ['Input Block', 'Process Block', 'Output Block', 'Decision Block', 'Filter Block', 'Join Block', 'Split Block', 'Random Block', 'Custom Block'];

		const listContainer = document.createElement('div');
		listContainer.style.display = 'flex';
		listContainer.style.flexDirection = 'column';
		listContainer.style.gap = '8px';

		blocks.forEach(blockName => {
			const item = document.createElement('div');
			item.textContent = blockName;
			item.style.padding = '8px';
			item.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
			item.setAttribute('draggable', 'true');
			item.style.cursor = 'grab';
			item.style.borderRadius = '4px';
			item.style.color = 'var(--vscode-list-foreground)';
			item.style.border = '1px solid transparent';

			item.addEventListener('dragstart', (e) => {
				if (e.dataTransfer) {
					e.dataTransfer.setData('text/plain', blockName);
					e.dataTransfer.effectAllowed = 'copy';
				}
			});

			item.onmouseover = () => {
				item.style.backgroundColor = 'var(--vscode-list-activeSelectionBackground)';
				item.style.color = 'var(--vscode-list-activeSelectionForeground)';
			};
			item.onmouseout = () => {
				item.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
				item.style.color = 'var(--vscode-list-foreground)';
			};

			listContainer.appendChild(item);
		});

		container.appendChild(listContainer);
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
	}
}
