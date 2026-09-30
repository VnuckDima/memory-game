export function el(tag, options = {}, children = []) {
  const { className, text, attrs, props, dataset, on } = options;
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  if (text !== undefined && text !== null) {
    node.textContent = String(text);
  }

  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
      if (value === undefined || value === null || value === false) {
        return;
      }
      node.setAttribute(name, value === true ? '' : String(value));
    });
  }

  if (props) {
    Object.entries(props).forEach(([name, value]) => {
      node[name] = value;
    });
  }

  if (dataset) {
    Object.entries(dataset).forEach(([name, value]) => {
      node.dataset[name] = String(value);
    });
  }

  if (on) {
    Object.entries(on).forEach(([eventName, handler]) => {
      node.addEventListener(eventName, handler);
    });
  }

  const childList = Array.isArray(children) ? children : [children];
  childList.filter(Boolean).forEach((child) => node.append(child));

  return node;
}
