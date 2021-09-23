import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  ToastAndroid,
  FlatList,
  TouchableOpacity,
  Button,
} from 'react-native';
import Main from './Main';

import SystemSetting from 'react-native-system-setting';
import BleManager from 'react-native-ble-manager';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import BluetoothSerial from 'react-native-bluetooth-serial-next';

const {width, height} = Dimensions.get('window');

Splash = () => {
  const [permissions, setPermissions] = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devAddress, setDevAddress] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({});
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    setLoading(true);
    if (Platform.OS === 'android') {
      _askPermissions();
    }
    _locationPermission();
    _requestBluetoothPermission();
  }, []);

  const _locationPermission = () => {
    SystemSetting.isLocationEnabled().then(enable => {
      if (enable) {
        console.log('Location is On');
      } else {
        Alert.alert(
          'Turn Location On',
          'Dual Camera App wants to turn on your Location',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed on Location Setting'),
              style: 'cancel',
            },
            {
              text: 'Settings',
              onPress: () => {
                SystemSetting.switchLocation();
              },
            },
          ],
        );
      }
    });
  };

  const isBluetoothOnDevice = () => {
    RNBluetoothClassic.isBluetoothAvailable()
      .then(isAvailable => {
        console.log('scanning', isAvailable);
        listIt();
        // startDiscovery();
      })
      .catch(e => {
        console.log('error aya is avalaible pr');
      });
  };

  const _requestBluetoothPermission = () => {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('The bluetooth is already enabled or the user confirmed');
      })
      .catch(() => {
        Alert.alert(
          'Turn Bluetooth',
          'This App wants to turn on your bluetooth',
          [
            {
              text: 'Cancel',
              onPress: () =>
                console.log('Cancel Pressed on Bluetooth Permissions'),
              style: 'cancel',
            },
            {
              text: 'Settings',
              onPress: () => {
                SystemSetting.switchBluetooth();
              },
            },
          ],
        );
      });
  };

  const startDiscovery = async () => {
    try {
      const result = await RNBluetoothClassic.startDiscovery();
      console.log('devices', result);
      // setDiscovery(true);
      let newDevice = result.find(item => item.name == "Wirad's A20");
      setTimeout(() => {
        typeof newDevice !== 'undefined'
          ? pairTheDevice(newDevice)
          : (console.log('Nhi mila isko'),
            ToastAndroid.show('Device not found', ToastAndroid.SHORT));
      }, 800);
    } catch (e) {
      console.log('erroer', e);
    }
  };

  const listIt = async () => {
    setDiscovery(false);
    setLoading(true);
    try {
      const devices = await BluetoothSerial.listUnpaired();
      console.log('Upaired list', devices);
      setDevices(devices);
      setDiscovery(true);
      setLoading(false);
    } catch (e) {
      console.log('Error aya at list', e);
    }
  };

  const connectDevice = async (device, isPaired) => {
    setLoading(true);
    console.log('device', device);
    setDeviceInfo(device);
    if (!isPaired) {
      _pairDevice(device);
    } else {
      setConnecting(true);
    }
  };

  const isDevicePaired = async device => {
    const list = await BluetoothSerial.list();
    console.log('Paired Devices', list);
    const isPaired = list.some(item => item.name == device.name);
    connectDevice(device, isPaired);
  };

  const _pairDevice = device => {
    console.log('chala pair device');
    BluetoothSerial.pairDevice(device.id)
      .then(some => {
        console.log('asdasdad', some);
        setConnecting(true);
      })
      .catch(e => console.log('error aya', e));
  };

  // const pairTheDevice = result => {
  //   console.log('aya', result.address);
  //   setDevAddress(result);
  //   RNBluetoothClassic.getBondedDevices()
  //     .then(devices => {
  //       console.log('Bonded Devices', devices);
  //       const found = devices.find(item => item.name === 'd-01H');
  //       typeof found == 'undefined'
  //         ? RNBluetoothClassic.pairDevice(result.address)
  //             .then(() => {
  //               console.log('PAIRIED SUCCESS');
  //               setDiscovery(true);
  //             })
  //             .catch(e => console.log('errorra at pair', e))
  //         : (console.log('device Paired hai already'), setDiscovery(true));
  //     })
  //     .catch(e => console.log('Error at check bonded device', e));
  // };

  const _askPermissions = () => {
    try {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then(results => {
        if (
          results['android.permission.ACCESS_FINE_LOCATION'] &&
          results['android.permission.ACCESS_COARSE_LOCATION'] &&
          results['android.permission.READ_EXTERNAL_STORAGE'] &&
          results['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          console.log('Permission are Accepted already');
          setPermissions(true);
          isBluetoothOnDevice();
        } else if (
          (results['android.permission.ACCESS_FINE_LOCATION'] &&
            results['android.permission.ACCESS_COARSE_LOCATION'] &&
            results['android.permission.READ_EXTERNAL_STORAGE'] &&
            results['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              'denied') ||
          (results['android.permission.ACCESS_FINE_LOCATION'] &&
            results['android.permission.ACCESS_COARSE_LOCATION'] &&
            results['android.permission.READ_EXTERNAL_STORAGE'] &&
            results['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              'never_ask_again')
        ) {
          ToastAndroid.show(
            'App cannot Start Without Accepting Permission',
            ToastAndroid.SHORT,
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  renderList = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          Alert.alert('Are You Sure?', 'Device will be connected', [
            {
              onPress: () => {
                isDevicePaired(item);
              },
              text: 'Ok',
              style: 'default',
            },
            {
              onPress: () => console.log('canceled'),
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
        }}>
        <View>
          <Text style={{color: '#d86f13', fontSize: height * 0.06}}>
            {item.name == null ? 'N/A' : item.name}
          </Text>
          <Text style={{color: '#9a4f0e', fontSize: height * 0.045}}>
            {item.id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (permissions && discovery && connecting) {
    return <Main device={deviceInfo} />;
  } else {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#20242C',
          }}>
          <ActivityIndicator size="large" color="#d86f13" />
          <Text style={{color: '#d86f13'}}>
            {!discovery ? 'Discovering' : !connecting ? 'Connecting' : ''}
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#20242C',
          }}>
          {devices.length == 0 ? (
            <View style={{alignItems: 'center'}}>
              <Text style={{color: '#d86f13', fontSize: height * 0.06}}>
                No Devices Found
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={devices}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={renderList}
                ItemSeparatorComponent={() => {
                  return (
                    <View
                      style={{
                        borderWidth: height * 0.001,
                        borderColor: '#d86f13',
                        marginVertical: height * 0.02,
                      }}
                    />
                  );
                }}
              />
              <View style={{marginTop: height * 0.025}}>
                <Button title="Re-Scan" onPress={listIt} color="#d86f13" />
              </View>
            </>
          )}
        </View>
      );
    }
  }
};

export default Splash;
