import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import RNFS from 'react-native-fs';

const {height, width} = Dimensions.get('window');

let readInterval = null;
let subs = null;

export default function Main({device}) {
  const yourDevice = BluetoothSerial.device(device.id);

  useEffect(() => {
    console.log('Mount Again');
    isDeviceConnected();
    readFile();
    return () => {
      console.log('Unmount');
      // unPair();
      clearInterval(readInterval);
    };
  }, []);

  const isDeviceConnected = async () => {
    try {
      const some = await yourDevice.connect();
      console.log('connected', some);
      read();
    } catch (e) {
      console.log('errors', e);
    }
  };

  const write = async () => {
    try {
      const response = await yourDevice.write('Hello World');
      console.log('aya response', response);
    } catch (e) {
      console.log('Error at write', e);
    }
  };

  const unPair = () => {
    BluetoothSerial.unpairDevice(device.id)
      .then(done => console.log('hoa unpair?', done))
      .catch(e => console.log('ayg err', e));
  };

  const initalizeRead = async () => {
    try {
      const data = await RNBluetoothClassic.readFromDevice(device.id);
      console.log('Data:', data);
    } catch (e) {
      console.log('Error at read', e);
    }
  };

  const read = () => {
    console.log('started read');
    readInterval = setInterval(() => {
      BluetoothSerial.readFromDevice()
        .then(data => {
          console.log('Data:', data);
        })
        .catch(e => console.log('Err', e));
    }, 3000);
  };

  const readFile = () => {
    var path = RNFS.ExternalStorageDirectoryPath + '/Wiral/config.txt';

    RNFS.readFile(path, 'utf8')
      .then(contents => {
        console.log('Contents', contents);
      })
      .catch(e => console.log('Error at readFile', e));
  };

  console.log('hai kuch', device);
  return (
    <LinearGradient
      start={{x: 0.1, y: 0.5}}
      end={{x: 0.1, y: 0.9}}
      locations={[0, 1]}
      colors={['#34373F', '#20242C']}
      style={styles.gradient}>
      <View style={styles.container}>
        <Text style={[styles.textStyle, {bottom: height * 0.05}]}>
          Start Sequence
        </Text>
        <TouchableOpacity
          onPress={() => {
            write();
            console.log('Started Sequences');
          }}>
          <LinearGradient
            colors={['#34373F', '#20242C']}
            style={{
              height: height * 0.25,
              width: height * 0.25,
              borderRadius: height * 0.25,
              elevation: height * 0.01,
            }}>
            <View style={styles.button}>
              <Text style={[styles.textStyle, {fontSize: width * 0.02}]}>
                Start
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  textStyle: {
    color: '#fff',
    fontSize: width * 0.03,
  },
  button: {
    height: height * 0.25,
    width: height * 0.25,
    borderRadius: height * 0.25,
    borderWidth: height * 0.002,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
