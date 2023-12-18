export const Log = (logText: string): void => {
  const console = document.getElementById('console');
  if (console != null) {
    console.insertAdjacentHTML('afterbegin', `<p>${logText}</p>`);
  }
};

export const LogClear = (): void => {
  const console = document.getElementById('console');
  if (console != null) {
    console.innerHTML = '';
  }
};
