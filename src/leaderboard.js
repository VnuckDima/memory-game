import { el } from './dom.js';
import { openModal } from './modal.js';
import { formatDate, getTopResults } from './storage.js';
import { pluralize } from './utils.js';

function createResultsTable(results) {
  const rows = results.map((result, index) =>
    el('tr', {}, [
      el('td', { className: 'leaderboard__place', text: String(index + 1) }),
      el('td', { text: `${result.moves} ${pluralize(result.moves, 'ход', 'хода', 'ходов')}` }),
      el('td', { text: formatDate(result.finishedAt) }),
    ]),
  );

  return el('table', { className: 'leaderboard' }, [
    el('thead', {}, [
      el('tr', {}, [
        el('th', { attrs: { scope: 'col' }, text: 'Место' }),
        el('th', { attrs: { scope: 'col' }, text: 'Ходы' }),
        el('th', { attrs: { scope: 'col' }, text: 'Дата' }),
      ]),
    ]),
    el('tbody', {}, rows),
  ]);
}

export function openLeaderboardModal() {
  const results = getTopResults();

  openModal({
    title: 'Таблица лидеров',
    subtitle: results.length ? 'Лучшие результаты за все сыгранные игры' : undefined,
    body: results.length
      ? [createResultsTable(results)]
      : [
          el('p', {
            className: 'leaderboard__empty',
            text: 'Пока нет результатов. Сыграйте первую игру!',
          }),
        ],
    actions: [{ label: 'Закрыть', onClick: () => {} }],
  });
}
