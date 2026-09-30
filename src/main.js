import { el } from './dom.js';
import { MemoryGame } from './game.js';
import { BACK_IMAGE_SRC } from './images.js';
import { openLeaderboardModal } from './leaderboard.js';

document.documentElement.style.setProperty('--card-back', `url("${BACK_IMAGE_SRC}")`);

function createButton({ label, icon, variant, onClick }) {
  return el(
    'button',
    {
      className: `button${variant ? ` button--${variant}` : ''}`,
      attrs: { type: 'button' },
      on: { click: onClick },
    },
    [
      icon ? el('span', { className: 'button__icon', text: icon, attrs: { 'aria-hidden': 'true' } }) : null,
      el('span', { className: 'button__label', text: label }),
    ].filter(Boolean),
  );
}

function createStat(label, value) {
  return el('div', { className: 'stat' }, [
    el('span', { className: 'stat__label', text: label }),
    value,
  ]);
}

function buildApp() {
  const board = el('div', {
    className: 'board',
    attrs: { role: 'group', 'aria-label': 'Игровое поле с карточками' },
  });
  const movesValue = el('span', {
    className: 'stat__value',
    text: '0',
    attrs: { 'aria-live': 'polite' },
  });
  const pairsValue = el('span', {
    className: 'stat__value',
    text: '0 из 8',
    attrs: { 'aria-live': 'polite' },
  });

  const game = new MemoryGame({
    boardEl: board,
    movesEl: movesValue,
    pairsEl: pairsValue,
  });

  const header = el('header', { className: 'app__header' }, [
    el('div', {}, [
      el('h1', { className: 'app__title', text: 'Memory Game' }),
      el('p', {
        className: 'app__subtitle',
        text: 'Открывайте карточки и находите все пары за меньшее число ходов',
      }),
    ]),
    el('div', { className: 'header__actions' }, [
      createButton({
        label: 'Новая игра',
        icon: '↻',
        variant: 'primary',
        onClick: () => game.newGame(),
      }),
      createButton({
        label: 'Таблица лидеров',
        icon: '★',
        onClick: () => openLeaderboardModal(),
      }),
    ]),
  ]);

  const app = el('main', { className: 'app' }, [
    header,
    el('div', { className: 'stats' }, [
      createStat('Ходы', movesValue),
      createStat('Найденные пары', pairsValue),
    ]),
    board,
    el('p', {
      className: 'app__hint',
      text: 'Закрыть окно можно кнопкой «Закрыть», кликом по затемнённому фону или клавишей Escape',
    }),
  ]);

  document.body.append(app);
  game.newGame();
}

buildApp();
