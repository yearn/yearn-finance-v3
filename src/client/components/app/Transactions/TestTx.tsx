import { FC } from 'react';
import styled from 'styled-components';

import { ProgressBar } from '@components/common';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxError } from './components/TxError';
export interface TestTxProps {
  onClose?: () => void;
}

const StyledTestTx = styled(TxContainer)``;

const LONG_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam at scelerisque leo. Vivamus sed tristique lectus. Sed risus dui, ultricies a diam non, tempus dignissim neque. Duis nec augue vitae tellus luctus finibus. Nulla hendrerit neque vitae cursus porta. Integer vulputate magna eu diam tempus egestas. In varius scelerisque massa ac pulvinar. Donec pellentesque cursus dignissim. Donec eget quam egestas, semper nulla non, hendrerit ipsum. Nam vitae tellus commodo, mattis leo id, suscipit sem. Nunc ipsum erat, interdum a est quis, laoreet accumsan orci. Morbi sed dui aliquam dolor iaculis faucibus. Nullam imperdiet elit at nunc rutrum pellentesque. Sed suscipit tincidunt faucibus. Donec nec dolor eleifend, malesuada mauris hendrerit, euismod lacus. Fusce non augue dolor. Praesent eget augue vitae nisl molestie lacinia sed eu justo. Morbi vulputate nisl sit amet elit porttitor, et sagittis sem convallis. Ut luctus vehicula pulvinar. Praesent quis justo eget tellus sodales accumsan ut id orci. Curabitur at nisl non quam dignissim condimentum vitae quis ligula. Nulla facilisi. Fusce elementum, mi eget ultricies sagittis, augue orci hendrerit elit, at tincidunt leo erat vitae sem. Nam sagittis mauris hendrerit, aliquam risus vitae, consectetur leo. Vestibulum scelerisque a odio id porta. Aliquam quis auctor enim. Nunc eu felis congue, euismod metus eget, dapibus metus. Aenean magna nibh, ultricies non sem sed, accumsan malesuada tellus. Nullam ac volutpat sem. Proin pellentesque fermentum neque. Nullam congue ipsum eget pretium imperdiet. Nulla ut neque et felis egestas laoreet consectetur sit amet urna. Etiam sodales, mi nec viverra blandit, neque ligula viverra eros, eu volutpat nulla massa a elit. Sed a sem vitae purus hendrerit consequat sed id urna. Vivamus convallis quam mi, vel rutrum augue suscipit ut. Nunc vel ornare metus, a commodo justo. Morbi vel auctor turpis. Vestibulum id lacinia nulla. In tincidunt sodales iaculis. Sed elementum hendrerit quam, iaculis lobortis lacus euismod non. Quisque ligula arcu, varius sit amet bibendum pulvinar, mattis vitae justo. Mauris at nisi eu orci tristique tempor id a nibh. Etiam sollicitudin sollicitudin dictum. Cras nec urna et nibh aliquam condimentum eget in lacus. Fusce ornare, ligula sed aliquam scelerisque, arcu dui placerat lacus, nec mattis ante orci at enim. Fusce lobortis risus neque. Donec mollis sit amet nulla in egestas. Pellentesque a ipsum sed sapien posuere tincidunt. Integer eget libero eros. Fusce vitae luctus quam, ac blandit leo. Cras ullamcorper viverra magna vel malesuada. In ac mollis leo. Cras aliquam erat imperdiet felis placerat malesuada. Aliquam a scelerisque nunc. Cras et bibendum magna. Fusce eros ex, tincidunt a diam et, dignissim mollis nulla. In sagittis sed diam luctus hendrerit. Nunc posuere odio sit amet arcu pharetra pulvinar.';

export const TestTx: FC<TestTxProps> = ({ onClose, children, ...props }) => {
  return (
    <StyledTestTx onClose={onClose} header="Invest" {...props}>
      {/* <TxTokenInput headerText="From wallet" /> */}

      {/* <TxTokenInput headerText="To vault" /> */}

      <ProgressBar value={2140} diffValue={3040} maxValue={5032} />
      <ProgressBar value={2140} diffValue={1540} maxValue={5032} />

      <TxError errorTitle="Test error" errorType="error" />

      <TxError errorTitle="Test warning" errorType="warning" />

      <TxError errorTitle="Test error with description" errorType="error" errorDescription={LONG_DESCRIPTION} />

      <TxError errorTitle="Test warning with description" errorType="warning" errorDescription={LONG_DESCRIPTION} />

      <TxActions>
        <TxActionButton onClick={() => console.log('approve')} disabled>
          Approve
        </TxActionButton>

        <TxActionButton onClick={() => console.log('deposit')}>Deposit</TxActionButton>

        <TxActionButton onClick={() => console.log('withdraw')} contrast>
          Loading
        </TxActionButton>
      </TxActions>

      <TxActions>
        <TxActionButton onClick={() => console.log('exit')} success>
          Success
        </TxActionButton>
      </TxActions>
    </StyledTestTx>
  );
};
