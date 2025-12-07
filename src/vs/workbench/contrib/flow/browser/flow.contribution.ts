/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.js';
import { IViewContainersRegistry, Extensions as ViewExtensions, ViewContainerLocation, IViewsRegistry } from '../../../common/views.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { FlowViewPane } from './flowViewPane.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { localize } from '../../../../nls.js';
import { EditorExtensions } from '../../../common/editor.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { FlowEditor } from './flowEditor.js';
import { FlowEditorInput } from './flowEditorInput.js';
import { Action2, registerAction2, MenuId } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';

// 1. Register Editor Pane
Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(
		FlowEditor,
		FlowEditor.ID,
		'Flow Editor'
	),
	[new SyncDescriptor(FlowEditorInput)]
);

// 2. Action to Open the Editor
registerAction2(class OpenFlowEditorAction extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.openFlowEditor',
			title: { value: 'Open Flow Editor', original: 'Open Flow Editor' },
			category: Categories.View,
			f1: true,
			icon: Codicon.circuitBoard,
			menu: {
				id: MenuId.CommandCenter,
				order: 101,
				when: undefined
			}
		});
	}

	async run(accessor: ServicesAccessor) {
		const editorService = accessor.get(IEditorService);
		await editorService.openEditor(new FlowEditorInput(), { pinned: true });
	}
});

// 3. Register View Container
const VIEW_CONTAINER = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: 'workbench.view.flow',
	title: { value: localize('flow', "Flow"), original: 'Flow' },
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, ['workbench.view.flow', { mergeViewWithContainerWhenSingleView: true }]),
	icon: Codicon.package,
	storageId: 'workbench.view.flow',
	hideIfEmpty: true,
	order: 1
}, ViewContainerLocation.Sidebar);

// 4. Register View
const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
viewsRegistry.registerViews([{
	id: 'workbench.view.flow.blocks',
	name: { value: localize('blocks', "Blocks"), original: 'Blocks' },
	containerIcon: Codicon.package,
	ctorDescriptor: new SyncDescriptor(FlowViewPane),
	canToggleVisibility: true,
	workspace: true,
	canMoveView: true,
	weight: 100,
	order: 1
}], VIEW_CONTAINER);
