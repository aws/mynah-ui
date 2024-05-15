import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './components/App';
import '@cloudscape-design/global-styles/index.css';
import { store } from './reducer';

let container: Element;
document.addEventListener('DOMContentLoaded', () => {
  if (container === undefined) {
    container = document.querySelector('#root') ?? document.body;
    createRoot(container).render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
});
