import * as microsoftTeams from '@microsoft/teams-js';
import { ICard, OverflowAction } from '../api/api.interface';
import * as queryString from 'query-string';
import { ISubmitAction, IOpenUrlAction, IShowCardAction } from 'adaptivecards/lib/schema';
import { removeUnsupportedActions } from '../api/api';
import { SyntheticEvent } from 'react';

// gets frame context from url
export const submitHandler = (err: string, result: string, target: HTMLElement): void => {
  console.log(`Err value: ${err}, result value : ${result}`);
  if (target) {
    target.focus();
  }
};

export const launchTaskModule = (element: HTMLElement, card: ICard): void => {
  // Only open task module if card is an Adaptive Card
  if (card.content.type && card.content.type === 'AdaptiveCard') {
    const taskInfo: microsoftTeams.TaskInfo = {
      height: undefined,
      width: 600,
      title: card.preview.title,
      url: undefined,
      card: card.content,
      completionBotId: card.botId,
    };
    //const elem = event.currentTarget as HTMLElement;
    microsoftTeams.tasks.startTask(taskInfo, (err: string, result: string) => submitHandler(err, result, element));
  } else {
    alert(`Could not load data, card type is not supported.`);
  }
};

export const getCommandId = (iUrl: string): string => {
  const url = queryString.parseUrl(iUrl);
  return url.query.commandId as string;
};

export const isInitialRun = (): boolean => {
  const url = queryString.parseUrl(window.location.href);
  return url.query.initialRun != null && url.query.initialRun == 'true';
};

// gets frame context from url
export const getFrameContext = (iUrl: string): string => {
  const url = queryString.parseUrl(iUrl);
  return url.query.frameContext as string;
};

export const processQueryResponse = (item: microsoftTeams.bot.Attachment, botID: string): ICard => {
  let url = '';
  if (item.previewRawPayload.content.hasOwnProperty('images')) {
    if (
      item.previewRawPayload.content.images &&
      item.previewRawPayload.content.images[0] &&
      item.previewRawPayload.content.images[0].url
    )
      url = item.previewRawPayload.content.images[0].url;
  }
  const out: ICard = {
    contentType: 'AdaptiveCard',
    content: removeUnsupportedActions(item.card.content),
    preview: {
      title: item.previewRawPayload.content.title,
      subTitle: item.previewRawPayload.content.subtitle,
      text: item.previewRawPayload.content.text,
      heroImageSrc: url,
    },
    botId: botID,
  };
  return out;
};

// converts a bot response to ICard
export const parseQueryResponse = (response: microsoftTeams.bot.Results): ICard[] => {
  if (response && response.attachments) {
    return response.attachments.map(
      (item: microsoftTeams.bot.Attachment): ICard => processQueryResponse(item, response.botId),
    );
  } else {
    return [];
  }
};

// Function to strip HTML tags from data
export const stripHTML = (html: string): string => {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export const processOverflowAction = (action: ISubmitAction | IOpenUrlAction | IShowCardAction): OverflowAction => {
  const supportedOverflowActions: string[] = ['Action.OpenUrl'];
  return {
    id: action.id,
    type: action.type,
    title: action.title,
    enabled: supportedOverflowActions.includes(action.type),
    url: action.type === 'Action.OpenUrl' ? action.url : undefined,
  };
};

export const getOverflowActions = (card: ICard): OverflowAction[] => {
  return card.content.actions.map(processOverflowAction);
};
