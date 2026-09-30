import { el } from './dom.js';
import { CARD_IMAGES, PAIRS_COUNT } from './images.js';
import { openModal } from './modal.js';
import { saveResult } from './storage.js';
import { pluralize, shuffle } from './utils.js';

/** Задержка закрытия несовпавшей пары (в диапазоне 700–1500 мс). */
export const MISMATCH_DELAY_MS = 1000;
/** Небольшая пауза, чтобы игрок увидел последнюю найденную пару. */
const WIN_MODAL_DELAY_MS = 550;

export class MemoryGame {
  constructor({ boardEl, movesEl, pairsEl }) {
    this.boardEl = boardEl;
    this.movesEl = movesEl;
    this.pairsEl = pairsEl;
    this.cards = [];
    this.moves = 0;
    this.foundPairs = 0;
    this.firstCard = null;
    this.isLocked = false;
    this.isFinished = false;
    this.isResultSaved = false;
    this.timerId = null;
  }

  /** Начать новую игру: перемешать карточки, закрыть их и обнулить счётчики. */
  newGame() {
    this.clearTimer();
    this.cards = this.createDeck();
    this.moves = 0;
    this.foundPairs = 0;
    this.firstCard = null;
    this.isLocked = false;
    this.isFinished = false;
    this.isResultSaved = false;
    this.render();
  }

  createDeck() {
    const deck = [];
    CARD_IMAGES.forEach((image) => {
      deck.push({ image, isOpen: false, isMatched: false, element: null });
      deck.push({ image, isOpen: false, isMatched: false, element: null });
    });
    return shuffle(deck);
  }

  render() {
    this.boardEl.replaceChildren(...this.cards.map((card) => this.createCardElement(card)));
    this.updateStats();
  }

  createCardElement(card) {
    const frontFace = el('span', { className: 'card__face card__face--front' }, [
      el('img', {
        className: 'card__image',
        attrs: { src: card.image.src, alt: card.image.title, draggable: 'false' },
      }),
    ]);
    const backFace = el('span', { className: 'card__face card__face--back' });

    card.element = el(
      'button',
      {
        className: 'card',
        attrs: { type: 'button', 'aria-label': this.getCardLabel(card) },
        on: { click: () => this.handleCardClick(card) },
      },
      [el('span', { className: 'card__inner' }, [backFace, frontFace])],
    );

    return card.element;
  }

  getCardLabel(card) {
    if (card.isMatched) {
      return `Найденная пара: ${card.image.title}`;
    }
    if (card.isOpen) {
      return `Открытая карточка: ${card.image.title}`;
    }
    return 'Закрытая карточка. Открыть';
  }

  handleCardClick(card) {
    if (this.isLocked || this.isFinished || card.isMatched || card.isOpen) {
      return;
    }

    this.openCard(card);

    if (!this.firstCard) {
      this.firstCard = card;
      return;
    }

    const firstCard = this.firstCard;
    this.firstCard = null;
    this.moves += 1;
    this.updateStats();

    if (firstCard.image.id === card.image.id) {
      this.matchCards(firstCard, card);
      return;
    }

    this.lockBoard(firstCard, card);
  }

  openCard(card) {
    card.isOpen = true;
    card.element.classList.add('is-open');
    card.element.setAttribute('aria-label', this.getCardLabel(card));
  }

  closeCard(card) {
    card.isOpen = false;
    card.element.classList.remove('is-open');
    card.element.setAttribute('aria-label', this.getCardLabel(card));
  }

  matchCards(firstCard, secondCard) {
    [firstCard, secondCard].forEach((card) => {
      card.isMatched = true;
      card.element.classList.remove('is-open');
      card.element.classList.add('is-matched');
      card.element.disabled = true;
      card.element.setAttribute('aria-label', this.getCardLabel(card));
    });

    this.foundPairs += 1;
    this.updateStats();

    if (this.foundPairs === PAIRS_COUNT) {
      this.finishGame();
    }
  }

  lockBoard(firstCard, secondCard) {
    this.isLocked = true;
    this.boardEl.classList.add('is-locked');
    this.timerId = window.setTimeout(() => {
      this.timerId = null;
      this.isLocked = false;
      this.boardEl.classList.remove('is-locked');
      this.closeCard(firstCard);
      this.closeCard(secondCard);
    }, MISMATCH_DELAY_MS);
  }

  clearTimer() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isLocked = false;
    this.boardEl.classList.remove('is-locked');
  }

  finishGame() {
    this.isFinished = true;

    let place = null;
    if (!this.isResultSaved) {
      this.isResultSaved = true;
      place = saveResult(this.moves).place;
    }

    this.timerId = window.setTimeout(() => {
      this.timerId = null;
      this.showWinModal(place);
    }, WIN_MODAL_DELAY_MS);
  }

  showWinModal(place) {
    const movesText = `${this.moves} ${pluralize(this.moves, 'ход', 'хода', 'ходов')}`;

    openModal({
      title: 'Победа!',
      subtitle: `Все пары найдены за ${movesText}.`,
      body: [
        el('p', {
          className: 'modal__text modal__result',
          text: `Ваш результат: ${movesText}.`,
        }),
        place
          ? el('p', {
              className: 'modal__text',
              text: `Место в таблице лидеров: ${place}.`,
            })
          : null,
      ].filter(Boolean),
      actions: [
        { label: 'Новая игра', icon: '↻', variant: 'primary', onClick: () => this.newGame() },
        { label: 'Закрыть', onClick: () => {} },
      ],
    });
  }

  updateStats() {
    this.movesEl.textContent = String(this.moves);
    this.pairsEl.textContent = `${this.foundPairs} из ${PAIRS_COUNT}`;
  }
}
