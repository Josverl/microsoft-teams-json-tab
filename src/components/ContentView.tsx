import React from 'react';

import { SearchBar } from './SearchBar';
import { Results } from './Results';
import { LoadIcon } from './LoadIcon';
import { ErrorView } from './ErrorView';

import { getResults } from '../api/api';

import * as microsoftTeams from '@microsoft/teams-js';
import { ICard } from '../api/api.interface';
import { getFrameContext, parseQueryResponse } from '../utils/utils';

// handlers
interface IContentViewProps {
  onThemeChange: any;
}

enum AppStateEnum {
  Loading = 'Loading',
  Error = 'Error',
  Render = 'Render',
}

export const ContentView = (props: IContentViewProps) => {
  // state hooks
  const [ViewOption, setViewOption] = React.useState('List');
  const [Result, setResult] = React.useState([] as ICard[]);
  const [AppState, setAppState] = React.useState(AppStateEnum.Render);
  const [ErrorMessage, setErrorMessage] = React.useState('Hmm... Something went wrong...');

  const onError = (error: string): any => {
    setAppState(AppStateEnum.Error);
    setErrorMessage(error);
  };

  const onResults = (response: microsoftTeams.bot.QueryResponse) => {
    setResult(parseQueryResponse(response));
    setAppState(AppStateEnum.Render);
  };

  const handleSearch = (query: string, viewOption: string) => {
    if (query !== undefined) {
      getResults(query, onResults, onError);
      setAppState(AppStateEnum.Loading);
    }
  };

  const handleViewChange = (viewOption: string) => {
    if (viewOption) {
      setViewOption(viewOption);
    }
  };

  // EFFECT HOOKS
  React.useEffect(() => {
    microsoftTeams.initialize();
    microsoftTeams.registerOnThemeChangeHandler(props.onThemeChange);
    getResults('', onResults, onError);
  }, [props.onThemeChange]);

  let view = <Results results={Result} viewOption={ViewOption} />;
  if (AppState === AppStateEnum.Loading) {
    view = <LoadIcon isLoading={true} />;
  } else if (AppState === AppStateEnum.Error) {
    view = <ErrorView message={ErrorMessage} />;
  }
  return (
    <div>
      <SearchBar onSearch={handleSearch} onViewChange={handleViewChange} />
      {view}
    </div>
  );
};
