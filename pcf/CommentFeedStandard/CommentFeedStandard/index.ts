import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { CommentFeedStandardApp, ICommentFeedStandardProps } from "./CommentFeedStandardApp";
import * as React from "react";
import { PcfContextService } from "comment-feed-library";

export class CommentFeedStandard implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private _pageEntityId = '';
    private _pageEntityType = '';
    private _pcfContextService!: PcfContextService;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        // Capture the host form's entity info once at load time.
        // context.page exists at runtime in model-driven apps but is absent from pcf-scripts typings.
        const page = (context as unknown as { page: { entityId: string; entityTypeName: string } }).page;
        this._pageEntityId   = page?.entityId ?? '';
        this._pageEntityType = page?.entityTypeName ?? '';
        this._pcfContextService = new PcfContextService({
            context,
            instanceid: this._pageEntityId,
            attachmentStorage: context.parameters.attachmentStorage.raw ?? 'SharePoint',
        });
        console.log('[CommentFeedStandard] _pageEntityId:', this._pageEntityId);
        console.log('[CommentFeedStandard] _pageEntityType:', this._pageEntityType);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // comments is a plain text field containing the regarding record ID.
        // Fall back to the host form's entity (captured in init) if not bound.
        const regardingId = context.parameters.comments.raw ?? this._pageEntityId;
        const regardingEntityType = this._pageEntityType;

        const props: ICommentFeedStandardProps = {
            pcfContextService: this._pcfContextService,
            regardingId,
            regardingEntityType,
            webApi: context.webAPI,
            currentUserName: context.userSettings.userName,
            currentUserId: context.userSettings.userId,
            allocatedHeight: context.mode.allocatedHeight,
        };
        return React.createElement(CommentFeedStandardApp, props);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return { };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
