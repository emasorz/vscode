/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { Schemas } from '../../../../base/common/network.js';
import { IUntypedEditorInput } from '../../../common/editor.js';

export class FlowEditorInput extends EditorInput {
	static readonly ID = 'workbench.editors.flowInput';
	static readonly RESOURCE = URI.from({ scheme: Schemas.inMemory, authority: 'flow', path: '/flow' });

	override get typeId(): string { return FlowEditorInput.ID; }
	override get editorId(): string | undefined { return FlowEditorInput.ID; }
	override getName(): string { return 'Flow Editor'; }

	override matches(other: EditorInput | IUntypedEditorInput): boolean {
		return super.matches(other) || other instanceof FlowEditorInput;
	}

	override get resource(): URI | undefined {
		return FlowEditorInput.RESOURCE;
	}

	override toUntyped(): IUntypedEditorInput {
		return {
			resource: FlowEditorInput.RESOURCE,
			options: {
				override: FlowEditorInput.ID
			}
		};
	}
}
