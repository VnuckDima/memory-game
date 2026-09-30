import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const MISMATCH_WAIT_MS = 1100;
const WIN_MODAL_WAIT_MS = 700;

let appCount = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mountApp() {
  const dom = new JSDOM(indexHtml, { url: 'http://localhost/', pretendToBeVisual: true });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;

  appCount += 1;
  await import(`../src/main.js?instance=${appCount}`);

  return dom.window.document;
}

function getCards(document) {
  return [...document.querySelectorAll('.card')];
}

function imageNameOf(cardElement) {
  return cardElement.querySelector('.card__image').getAttribute('src');
}

function clickCard(document, cardElement) {
  cardElement.click();
}

function findPairIndices(document) {
  const cards = getCards(document);
  const groups = new Map();

  cards.forEach((card, index) => {
    const key = imageNameOf(card);
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });

  return [...groups.values()].filter((indices) => indices.length === 2);
}

function isOpen(cardElement) {
  return cardElement.classList.contains('is-open') || cardElement.classList.contains('is-matched');
}

test('в <body> исходной разметки только скрипт', () => {
  const bodyChildren = [...indexHtml.match(/<body>([\s\S]*?)<\/body>/)[1].matchAll(/<\s*([a-zA-Z][\w-]*)/g)]
    .map((match) => match[1].toLowerCase());

  assert.deepEqual(bodyChildren, ['script']);
});

test('при загрузке создаётся поле из 16 закрытых карточек и нулевые счётчики', async () => {
  const document = await mountApp();

  assert.equal(getCards(document).length, 16);
  assert.equal(new Set(getCards(document).map(imageNameOf)).size, 8);
  assert.ok(getCards(document).every((card) => !isOpen(card)));
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '0');
  assert.equal(document.querySelectorAll('.stat__value')[1].textContent, '0 из 8');
  assert.equal(document.querySelectorAll('.header__actions .button').length, 2);
});

test('несовпавшая пара закрывается через 700–1500 мс, а счётчик ходов растёт', async () => {
  const document = await mountApp();
  const cards = getCards(document);
  const different = cards.find(
    (card, index) => imageNameOf(card) !== imageNameOf(cards[(index + 1) % 16]) && !card.classList.contains('is-matched'),
  );
  const partner = cards[(cards.indexOf(different) + 1) % 16];

  clickCard(document, different);
  assert.ok(different.classList.contains('is-open'));

  clickCard(document, partner);
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '1');
  assert.ok(partner.classList.contains('is-open'));

  // Во время блокировки другие карточки выбрать нельзя.
  clickCard(document, cards[3]);
  assert.ok(!cards[3].classList.contains('is-open'));

  await sleep(MISMATCH_WAIT_MS);

  assert.ok(!different.classList.contains('is-open'));
  assert.ok(!partner.classList.contains('is-open'));
});

test('совпавшая пара остаётся открытой, повторные клики игнорируются', async () => {
  const document = await mountApp();
  const cards = getCards(document);
  const [firstIndex, secondIndex] = findPairIndices(document)[0];

  clickCard(document, cards[firstIndex]);
  clickCard(document, cards[secondIndex]);

  assert.equal(document.querySelectorAll('.stat__value')[1].textContent, '1 из 8');
  assert.ok(cards[firstIndex].classList.contains('is-matched'));
  assert.ok(cards[secondIndex].classList.contains('is-matched'));

  clickCard(document, cards[firstIndex]);
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '1');
  assert.equal(document.querySelectorAll('.stat__value')[1].textContent, '1 из 8');
});

test('после победы открывается модальное окно, результат попадает в localStorage', async () => {
  const document = await mountApp();
  const cards = getCards(document);

  findPairIndices(document).forEach(([firstIndex, secondIndex]) => {
    clickCard(document, cards[firstIndex]);
    clickCard(document, cards[secondIndex]);
  });

  await sleep(WIN_MODAL_WAIT_MS);

  const modal = document.querySelector('.modal');
  assert.ok(modal, 'модальное окно победы открыто');
  assert.match(modal.textContent, /Победа/);
  assert.match(modal.textContent, /8 ходов/);

  const saved = JSON.parse(document.defaultView.localStorage.getItem('memory-game:results:v1'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].moves, 8);

  // Закрытие по Escape не сбрасывает игру.
  document.dispatchEvent(new document.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(document.querySelector('.modal'), null);
  assert.equal(document.querySelectorAll('.stat__value')[1].textContent, '8 из 8');

  // Клики по карточкам завершённой игры ничего не меняют.
  clickCard(document, cards[0]);
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '8');
});

test('таблица лидеров сортируется и не сбрасывает игру', async () => {
  const document = await mountApp();
  const store = document.defaultView.localStorage;

  store.setItem(
    'memory-game:results:v1',
    JSON.stringify([
      { moves: 12, finishedAt: '2026-01-05T10:00:00.000Z' },
      { moves: 9, finishedAt: '2026-01-05T11:00:00.000Z' },
      { moves: 9, finishedAt: '2026-01-05T09:00:00.000Z' },
    ]),
  );

  const cards = getCards(document);
  clickCard(document, cards[0]);

  document.querySelectorAll('.header__actions .button')[1].click();
  const rows = [...document.querySelectorAll('.leaderboard tbody tr')].map((row) =>
    [...row.querySelectorAll('td')].map((cell) => cell.textContent),
  );

  assert.deepEqual(rows, [
    ['1', '9 ходов', '05.01.2026'],
    ['2', '9 ходов', '05.01.2026'],
    ['3', '12 ходов', '05.01.2026'],
  ]);

  document.querySelector('.modal').click();
  assert.equal(document.querySelector('.modal'), null);
  assert.ok(cards[0].classList.contains('is-open'), 'открытая карточка осталась открытой');
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '0');
});

test('«Новая игра» сбрасывает поле и отменяет таймер несовпавшей пары', async () => {
  const document = await mountApp();
  const cards = getCards(document);

  clickCard(document, cards[0]);
  clickCard(document, cards[1]);
  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '1');

  document.querySelectorAll('.header__actions .button')[0].click();

  assert.equal(document.querySelectorAll('.stat__value')[0].textContent, '0');
  assert.equal(document.querySelectorAll('.stat__value')[1].textContent, '0 из 8');
  assert.ok(getCards(document).every((card) => !isOpen(card)));

  // Старый таймер отменён: кликнуть карточку можно сразу.
  const newCards = getCards(document);
  clickCard(document, newCards[0]);
  assert.ok(newCards[0].classList.contains('is-open'));
});

test('пустая таблица лидеров показывает сообщение', async () => {
  const document = await mountApp();

  document.querySelectorAll('.header__actions .button')[1].click();

  assert.match(document.querySelector('.modal').textContent, /Пока нет результатов/);
});
