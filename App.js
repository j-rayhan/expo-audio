/**
 * @flow
 */

import React from 'react';
import {
  Dimensions,
  Image,
  Slider,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import * as Permissions from 'expo-permissions';
const source = require('./assets/sounds/test1.mp3');

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

const ICON_RECORD_BUTTON = new Icon(require('./assets/images/record_button.png'), 70, 119);
const ICON_RECORDING = new Icon(require('./assets/images/record_icon.png'), 20, 14);

const ICON_PLAY_BUTTON = new Icon(require('./assets/images/play_button.png'), 34, 51);
const ICON_PAUSE_BUTTON = new Icon(require('./assets/images/pause_button.png'), 34, 51);
const ICON_STOP_BUTTON = new Icon(require('./assets/images/stop_button.png'), 22, 22);

const ICON_MUTED_BUTTON = new Icon(require('./assets/images/muted_button.png'), 67, 58);
const ICON_UNMUTED_BUTTON = new Icon(require('./assets/images/unmuted_button.png'), 67, 58);

const ICON_TRACK_1 = new Icon(require('./assets/images/track_1.png'), 166, 5);
const ICON_THUMB_1 = new Icon(require('./assets/images/thumb_1.png'), 18, 19);
const ICON_THUMB_2 = new Icon(require('./assets/images/thumb_2.png'), 15, 19);

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
    };
    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  componentDidMount() {
    (async () => {
      await Font.loadAsync({
        'cutive-mono-regular': require('./assets/fonts/CutiveMono-Regular.ttf'),
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
    this._loadNewPlaybackInstance(true);
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };

  _loadNewPlaybackInstance = async (playing) => {
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
     const initialStatus = {
//        Play by default
          shouldPlay: true,
//        Control the speed
          rate: 1.0,
//        Correct the pitch
          shouldCorrectPitch: true,
//        Control the Volume
          volume: 1.0,
//        mute the Audio
          isMuted: false
     };
     const { sound, status } = await Audio.Sound.createAsync(
         source,
         initialStatus
    );
    this.sound = sound;

    this.setState({
      isLoading: false,
    });
  }
  _onPlayPausePressed = () => {
    console.log('PRINT IN %s=====>','play sound', this.sound);
    if (this.sound != null) {
      if (!this.state.isPlaying) {
        this.sound.pauseAsync();
        this.setState({isPlaying: true})
      } else {
        this.sound.playAsync();
        this.setState({isPlaying: false})
      }
    }
  };

  _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  };

  render() {
    if(!this.state.fontLoaded) {
        return (
            <View style={styles.emptyContainer} />
        )
    }

    if (!this.state.haveRecordingPermissions){
        return (
            <View style={styles.container}>
                <View />
                <Text style={[styles.noPermissionsText, { fontFamily: 'cutive-mono-regular' }]}>
                  You must enable audio recording permissions in order to use this app.
                </Text>
                <View />
            </View>
        )
    }

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.halfScreenContainer,
            {
              opacity:
                !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}>
          <View />
          <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
            <View style={styles.playStopContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPlayPausePressed}>
                <Text>Play/Puse</Text>
              </TouchableHighlight>
            </View>
            <View />
            <View style={styles.playStopContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onStopPressed}>
                <Text>Stop</Text>
              </TouchableHighlight>
            </View>
          </View>
          <View />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT,
  },
  noPermissionsText: {
    textAlign: 'center',
  },
  wrapper: {},
  halfScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: DEVICE_HEIGHT / 2.0,
    maxHeight: DEVICE_HEIGHT / 2.0,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: ICON_RECORD_BUTTON.height,
    maxHeight: ICON_RECORD_BUTTON.height,
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: ICON_RECORD_BUTTON.height,
    maxHeight: ICON_RECORD_BUTTON.height,
    minWidth: ICON_RECORD_BUTTON.width * 3.0,
    maxWidth: ICON_RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: ICON_RECORDING.height,
    maxHeight: ICON_RECORDING.height,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 300,
    backgroundColor: 'yellow',
    minWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
    maxWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    maxHeight: ICON_THUMB_1.height,
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
});
