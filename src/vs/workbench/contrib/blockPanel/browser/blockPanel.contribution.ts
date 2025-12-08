import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import {
	IViewContainersRegistry,
	IViewsRegistry,
	ViewContainerLocation,
} from "../../../common/views.js";
import { Extensions as ViewExtensions } from "../../../common/views.js";

// Identificatori
export const FLOW_EDITOR_ID = "Flow Editor";
export const FLOW_EDITOR_TITLE = "Flow Editor";

// View
export class BlockPanelViewPane extends ViewPane {
	protected override renderBody(container: HTMLElement): void {
		const el = document.createElement("div");
		el.innerText = "Loading Flow Editor...";
		el.style.padding = "10px";
		container.appendChild(el);
	}
}

export class BlockPanelContribution {
	constructor() {
		this.registerView();
	}

	private registerView() {
		const VIEW_CONTAINER = Registry.as<IViewContainersRegistry>(
			ViewExtensions.ViewContainersRegistry
		).registerViewContainer(
			{
				id: FLOW_EDITOR_ID,
				title: {
					value: "Flow Editor",
					original: "Flow Editor",
				},
				ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [
					FLOW_EDITOR_ID,
					{ mergeViewWithContainerWhenSingleView: true },
				]),
				storageId: FLOW_EDITOR_ID,
				icon: undefined,
				order: 0, // posizione
			},
			ViewContainerLocation.AuxiliaryBar
		); // PANNELLO A DESTRA (ora centrale)

		// Registrazione View
		Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews(
			[
				{
					id: FLOW_EDITOR_ID,
					name: {
						value: "PFlow Editor Name",
						original: "Flow Editor Name",
					},
					ctorDescriptor: new SyncDescriptor(BlockPanelViewPane),
					canMoveView: true,
					canToggleVisibility: true,
				},
			],
			VIEW_CONTAINER
		);
	}
}
