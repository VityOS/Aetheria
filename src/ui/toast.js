export function createToast(element) {
  let timer;
  return message => {
    clearTimeout(timer);
    element.textContent = message;
    element.classList.add('show');
    timer = setTimeout(() => element.classList.remove('show'), 2400);
  };
}
