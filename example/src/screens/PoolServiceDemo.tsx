import * as React from 'react';

import { ScrollView, StyleSheet } from 'react-native';
import {
  Pool,
  initPoolService,
  createPool,
} from '@coinbase/waas-sdk-react-native';
import { ContinueButton } from '../components/ContinueButton';
import { DemoStep } from '../components/DemoStep';
import { DemoText } from '../components/DemoText';
import { ErrorText } from '../components/ErrorText';
import { InputText } from '../components/InputText';
import { PageTitle } from '../components/PageTitle';
import { CopyButton } from '../components/CopyButton';
import AppContext from '../components/AppContext';
import { MonospaceText } from '../components/MonospaceText';
import { ModeContext } from '../utils/ModeProvider';
import { directMode, proxyMode } from '../constants';

export const PoolServiceDemo = () => {
  const [poolDisplayName, setPoolDisplayName] = React.useState<string>('');
  const [displayNameEditable, setDisplayNameEditable] =
    React.useState<boolean>(true);
  const [resultPool, setResultPool] = React.useState<Pool>();
  const [resultError, setResultError] = React.useState<Error>();

  const [showStep2, setShowStep2] = React.useState<boolean>();
  const [showStep3, setShowStep3] = React.useState<boolean>();
  const [showError, setShowError] = React.useState<boolean>();

  const { selectedMode } = React.useContext(ModeContext);
  const {
    apiKeyName: apiKeyName,
    privateKey: privateKey,
    proxyUrl: proxyUrl,
  } = React.useContext(AppContext) as {
    apiKeyName: string;
    privateKey: string;
    proxyUrl: string;
  };

  // Creates a Pool once the API key, API secret, and Pool display name are defined.
  React.useEffect(() => {
    let createPoolFn = async function () {
      if (!showStep2 || poolDisplayName === '') {
        return;
      }

      if (
        selectedMode === directMode &&
        (apiKeyName === '' || privateKey === '')
      ) {
        return;
      }

      try {
        const apiKey = selectedMode === proxyMode ? '' : apiKeyName;
        const privKey = selectedMode === proxyMode ? '' : privateKey;

        await initPoolService(apiKey, privKey, proxyUrl);
        const createdPool = await createPool(poolDisplayName);

        setResultPool(createdPool);
        setShowStep3(true);
      } catch (error) {
        setResultError(error as Error);
        setShowError(true);
      }
    };

    createPoolFn();
  }, [
    apiKeyName,
    privateKey,
    poolDisplayName,
    proxyUrl,
    showStep2,
    selectedMode,
  ]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      <PageTitle title="Pool Creation" />
      <DemoStep>
        <DemoText>1. Input your Pool's desired display name:</DemoText>
        <InputText
          onTextChange={setPoolDisplayName}
          editable={displayNameEditable}
        />
        <ContinueButton
          onPress={() => {
            setShowStep2(true);
            setDisplayNameEditable(false);
          }}
        />
      </DemoStep>
      {showStep2 && (
        <DemoStep>
          <DemoText>2. Creating your Pool...</DemoText>
        </DemoStep>
      )}
      {showStep3 && (
        <DemoStep>
          <DemoText>
            3. Successfully created and got Pool resource with display name "
            {resultPool?.displayName}":
          </DemoText>
          <MonospaceText verticalMargin={10}>{resultPool?.name}</MonospaceText>
          <DemoText>
            Copy your Pool resource name and paste it into a notepad before
            proceeding to the next demo.
          </DemoText>
          <CopyButton text={resultPool?.name!} />
        </DemoStep>
      )}
      {showError && (
        <DemoStep>
          <ErrorText>ERROR: {resultError?.message}</ErrorText>
        </DemoStep>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});
