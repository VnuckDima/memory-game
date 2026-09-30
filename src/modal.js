import { el } from './dom.js';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const openModals = [];

function syncScrollLock() {
  document.body.classList.toggle('is-modal-open', openModals.length > 0);
}

function getFocusable(dialog) {
  // offsetParent === null только у скрытых элементов, поэтому такой признак
  // подходит для поиска доступных кнопок внутри открытого окна.
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (node) => !node.disabled && node.offsetParent !== null,
  );
}

/**
 * Общий компонент модальных окон: оболочка, затемнение, блокировка прокрутки,
 * закрытие по кнопке, клику по фону и клавише Escape.
 * Содержимое и набор кнопок передаются отдельно для каждого окна.
 */
export function openModal({ title, subtitle, body = [], actions = [] }) {
  const previouslyFocused = document.activeElement;
  const titleId = `modal-title-${openModals.length}-${Date.now()}`;

  const actionButtons = actions.map(({ label, icon, variant, onClick }) =>
    el(
      'button',
      {
        className: `button${variant ? ` button--${variant}` : ''}`,
        attrs: { type: 'button' },
        on: {
          click: () => {
            close();
            if (typeof onClick === 'function') {
              onClick();
            }
          },
        },
      },
      [
        icon
          ? el('span', { className: 'button__icon', text: icon, attrs: { 'aria-hidden': 'true' } })
          : null,
        el('span', { className: 'button__label', text: label }),
      ].filter(Boolean),
    ),
  );

  const dialog = el(
    'div',
    {
      className: 'modal__dialog',
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    },
    [
      el('h2', { className: 'modal__title', text: title, attrs: { id: titleId } }),
      subtitle ? el('p', { className: 'modal__text', text: subtitle }) : null,
      ...body,
      actionButtons.length ? el('div', { className: 'modal__actions' }, actionButtons) : null,
    ].filter(Boolean),
  );

  const overlay = el(
    'div',
    {
      className: 'modal',
      on: {
        click: (event) => {
          if (event.target === overlay) {
            close();
          }
        },
      },
    },
    [dialog],
  );

  const handle = { isOpen: true, onClose: null, close: () => {} };

  function close() {
    if (!handle.isOpen) {
      return;
    }
    handle.isOpen = false;
    const index = openModals.indexOf(handle);
    if (index !== -1) {
      openModals.splice(index, 1);
    }
    document.removeEventListener('keydown', onKeydown, true);
    overlay.remove();
    syncScrollLock();
    if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    if (typeof handle.onClose === 'function') {
      handle.onClose();
    }
  }

  function onKeydown(event) {
    if (openModals[openModals.length - 1] !== handle) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusable(dialog);
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  openModals.push(handle);
  document.body.append(overlay);
  document.addEventListener('keydown', onKeydown, true);
  syncScrollLock();

  const focusable = getFocusable(dialog);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    dialog.setAttribute('tabindex', '-1');
    dialog.focus();
  }

  handle.close = close;
  return handle;
}
