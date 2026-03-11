import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { CommentFeedDataSetApp, ICommentFeedDataSetAppProps } from "./CommentFeedDataSetApp";
import * as React from "react";

export class CommentFeedDataSet implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private _pageEntityId = '';
    private _pageEntityType = '';

    constructor() {
        // Empty
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        const page = (context as unknown as { page: { entityId: string; entityTypeName: string } }).page;
        this._pageEntityId   = page?.entityId ?? '';
        this._pageEntityType = page?.entityTypeName ?? '';
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const props: ICommentFeedDataSetAppProps = {
            sampleDataSet: context.parameters.sampleDataSet,
            webApi: context.webAPI,
            currentUserName: context.userSettings.userName,
            currentUserId: context.userSettings.userId,
            allocatedHeight: context.mode.allocatedHeight,
            pageEntityId: this._pageEntityId,
            pageEntityType: this._pageEntityType,
        };
        return React.createElement(CommentFeedDataSetApp, props);
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
