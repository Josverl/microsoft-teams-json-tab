import React from 'react';
import { Menu } from '@stardust-ui/react';
import { ICard, OverflowAction } from '../api/api.interface';
import { getOverflowActions } from '../utils/utils';

export interface OverflowProps {
  card: ICard;
  styles?: object;
  title?: string;
  openMenu: boolean;
}

export const Overflow: React.FC<OverflowProps> = (props: OverflowProps): JSX.Element => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (props.openMenu) {
      setMenuOpen(true);
    }
  });

  const displayActions = (action: OverflowAction) => ({
    key: action.id,
    content: action.title,
    disabled: !action.enabled,
    onClick: action.url ? () => window.open(action.url) : undefined,
  });

  const actions = getOverflowActions(props.card);

  const items = [
    {
      key: 'more',
      icon: {
        name: 'more',
        outline: true,
      },
      menuOpen,
      active: menuOpen,
      indicator: false,
      menu: {
        items: actions.map(displayActions),
      },
      onMenuOpenChange: (e: any, { menuOpen }: any) => {
        setMenuOpen(menuOpen);
      },
    },
  ];

  return <Menu iconOnly items={items} styles={props.styles} title={props.title} />;
};
