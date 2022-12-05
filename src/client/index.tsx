import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import '@i18n';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { AppContextProvider, NavSideMenuContextProvider } from '@context';
import { Routes } from '@routes';
import { Themable } from '@containers';

import '@assets/fonts/RobotoFont.css';
import '@assets/fonts/AeonikFont.css';
import '@assets/fonts/AeonikMonoFont.css';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    scroll-behavior: unset;
  }

  html {
    font-size: 62.5%;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.texts};
    font-size: 1.6rem;
    overflow: hidden;
    overflow-y: scroll;
    font-family: ${(props) => props.theme.globalFont};
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    transition-duration: .15s
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  :root {
    --onboard-font-size-1: 4.8rem;
    --onboard-font-size-2: 3.6rem;
    --onboard-font-size-3: 2.4rem;
    --onboard-font-size-4: 2rem;
    --onboard-font-size-5: 1.6rem;
    --onboard-font-size-6: 1.4rem;
    --onboard-font-size-7: 1.2rem;

    --onboard-spacing-1: 4.8rem;
    --onboard-spacing-2: 3.2rem;
    --onboard-spacing-3: 2.4rem;
    --onboard-spacing-4: 1.6rem;
    --onboard-spacing-5: 0.8rem;

    --onboard-modal-z-index: ${(props) => props.theme.zindex.onboardModal};
  }

  a {
    text-decoration: none;
    &:visited {
      color: inherit;
    }
  }

  p {
    margin: 0;
  }

  p + p {
    margin-top: 1rem;
  }

  [disabled],
  .disabled {
    opacity: 0.7;
    cursor: default;
    pointer-events: none;
  }

  .bn-onboard-modal {
    z-index: ${(props) => props.theme.zindex.onboardModal}
  }
`;

const container = new Container();
const store = getStore(container);

export const App = () => {
  return (
    <Provider store={store}>
      <AppContextProvider context={container.context}>
        <NavSideMenuContextProvider>
          <Themable>
            <GlobalStyle />
            <Suspense fallback={null}>
              <Routes />
            </Suspense>
          </Themable>
        </NavSideMenuContextProvider>
      </AppContextProvider>
    </Provider>
  );
};

export default App;
