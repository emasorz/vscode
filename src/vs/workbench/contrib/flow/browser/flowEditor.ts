/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWebviewService, IOverlayWebview, WebviewContentPurpose } from '../../webview/browser/webview.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { FlowEditorInput } from './flowEditorInput.js';
import { MutableDisposable } from '../../../../base/common/lifecycle.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { URI } from '../../../../base/common/uri.js';
import { asWebviewUri, webviewGenericCspSource } from '../../webview/common/webview.js';
import { generateUuid } from '../../../../base/common/uuid.js';

export class FlowEditor extends EditorPane {
	static readonly ID = 'workbench.editors.flowEditor';

	private _webview = this._register(new MutableDisposable<IOverlayWebview>());
	private _container: HTMLElement | undefined;
	private _dimension: Dimension | undefined;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWebviewService private readonly webviewService: IWebviewService,
		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService
	) {
		super(FlowEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected createEditor(parent: HTMLElement): void {
		this._container = parent;
	}

	override async setInput(input: FlowEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void> {
		await super.setInput(input, options, context, token);

		if (!this._webview.value) {
			this._webview.value = this.webviewService.createWebviewOverlay({
				title: 'Flow Editor',
				options: {
					purpose: WebviewContentPurpose.CustomEditor,
					retainContextWhenHidden: true
				},
				contentOptions: {
					allowScripts: true,
					localResourceRoots: [
						URI.file('/Users/emanuelesorzana/Documents/Projects/vscode/flow-editor/dist/flow-editor')
					]
				},
				extension: undefined
			});
			this._webview.value.setHtml(this.getWebviewContent());
		}

		if (this.isVisible()) {
			this._webview.value.claim(this, this.window, undefined);
			if (this._container) {
				const rootContainer = this.layoutService.getContainer(this.window, Parts.EDITOR_PART);
				this._webview.value.layoutWebviewOverElement(this._container, this._dimension, rootContainer);
			}
		}
	}

	override setVisible(visible: boolean): void {
		super.setVisible(visible);
		if (this._webview.value) {
			if (visible) {
				this._webview.value.claim(this, this.window, undefined);
				if (this._container) {
					const rootContainer = this.layoutService.getContainer(this.window, Parts.EDITOR_PART);
					this._webview.value.layoutWebviewOverElement(this._container, this._dimension, rootContainer);
				}
			} else {
				this._webview.value.release(this);
			}
		}
	}

	layout(dimension: Dimension): void {
		this._dimension = dimension;
		if (this._webview.value && this.isVisible() && this._container) {
			const rootContainer = this.layoutService.getContainer(this.window, Parts.EDITOR_PART);
			this._webview.value.layoutWebviewOverElement(this._container, dimension, rootContainer);
		}
	}

	private getWebviewContent(): string {
		const basePath = URI.file('/Users/emanuelesorzana/Documents/Projects/vscode/flow-editor/dist/flow-editor/browser');

		const stylesUri = asWebviewUri(URI.joinPath(basePath, 'styles.css'), undefined);
		const mainUri = asWebviewUri(URI.joinPath(basePath, 'main.js'), undefined);

		const nonce = generateUuid();

		const cspSource = webviewGenericCspSource;

		return `<!DOCTYPE html>
		<html>
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<link rel="stylesheet" href="${stylesUri}">
			</head>
			<body>
				<app-root>
					<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: var(--vscode-foreground);">
						<h2>Loading Flow Editor...</h2>
					</div>
				</app-root>

				<!-- Angular Scripts -->
				<script nonce="${nonce}" src="${mainUri}"></script>

				<script nonce="${nonce}">
					// Simple error handler to help debugging
					window.addEventListener('error', (e) => {
						const el = document.createElement('div');
						el.style.color = 'red';
						el.style.padding = '20px';
						el.textContent = 'Error: ' + e.message;
						document.body.prepend(el);
					});
				</script>
			</body>
		</html>`;
	}
}
