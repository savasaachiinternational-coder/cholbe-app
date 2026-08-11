/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { initCrashReporting } from './src/monitoring/sentry';
import App from './App';
import { name as appName } from './app.json';

initCrashReporting();

AppRegistry.registerComponent(appName, () => App);
