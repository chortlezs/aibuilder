import { useCallback, useRef } from 'react';
import { useAppStore, BehaviorType, MindfulnessState } from '../store/appStore';

// Web Bluetooth API types (partial) for TypeScript
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }
  
  interface RequestDeviceOptions {
    filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }
  
  interface BluetoothDevice extends EventTarget {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    watchAdvertisements(): Promise<void>;
    unwatchAdvertisements(): void;
    watchingAdvertisements: boolean;
  }
  
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>;
  }

  interface BluetoothRemoteGATTService {
    uuid: string;
    isPrimary: boolean;
    device: BluetoothDevice;
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
    getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }

  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    uuid: string;
    service: BluetoothRemoteGATTService;
    properties: BluetoothCharacteristicProperties;
    value?: DataView;
    getDescriptor(descriptor: string): Promise<BluetoothRemoteGATTDescriptor>;
    getDescriptors(descriptor?: string): Promise<BluetoothRemoteGATTDescriptor[]>;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    writeValueWithResponse(value: BufferSource): Promise<void>;
    writeValueWithoutResponse(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothCharacteristicProperties {
    broadcast: boolean;
    read: boolean;
    writeWithoutResponse: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
    authenticatedSignedWrites: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
  }

  interface BluetoothRemoteGATTDescriptor {
    uuid: string;
    characteristic: BluetoothRemoteGATTCharacteristic;
    value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
  }
}

// 模拟 ESP32 的服务 UUID，实际开发中需要替换为真实 UUID
// 你可以暂时注释掉写死的 UUID，改为动态获取
// const ESP32_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
// const ESP32_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

export const useBluetooth = () => {
  const { setDeviceStatus, setCurrentBehavior, setMindfulnessState, setCurrentPressure } = useAppStore();
  const deviceRef = useRef<BluetoothDevice | null>(null);

  const connect = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        alert('您的浏览器不支持蓝牙连接 (Web Bluetooth API)。请使用 Chrome 或 Edge 浏览器，并确保在 localhost 或 HTTPS 协议下运行。');
        return;
      }

      setDeviceStatus('connecting');
      console.log('Requesting Bluetooth Device...');
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });

      deviceRef.current = device;
      console.log('Connecting to GATT Server...');
      
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Cannot connect to GATT Server');

      console.log('Getting Services...');
      // 获取设备上的所有服务
      const services = await server.getPrimaryServices();
      console.log(`Found ${services.length} services.`);
      
      if (services.length === 0) {
        throw new Error('No services found on device.');
      }

      // 我们取第一个找到的服务来尝试获取特征值（如果是定制开发板，你也可以遍历找到你要的）
      const service = services[0];
      console.log(`Using Service: ${service.uuid}`);

      const characteristics = await service.getCharacteristics();
      console.log(`Found ${characteristics.length} characteristics in service.`);

      if (characteristics.length === 0) {
        throw new Error('No characteristics found in service.');
      }

      // 取第一个特征值
      const characteristic = characteristics[0];
      console.log(`Using Characteristic: ${characteristic.uuid}`);

      console.log('Starting Notifications...');
      await characteristic.startNotifications();

      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value: DataView = event.target.value;
        // 假设设备端直接传回行为状态的字符串或特定编码
        // 这里做一个简单的模拟解析：
        const decoder = new TextDecoder('utf-8');
        const strValue = decoder.decode(value);
        
        parseBleData(strValue);
      });

      device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        setDeviceStatus('disconnected');
      });

      setDeviceStatus('connected');
    } catch (error: any) {
      console.error('Bluetooth Error:', error);
      // 捕捉用户取消或其他错误，给出明确提示
      if (error.name === 'NotFoundError') {
        alert('未找到蓝牙设备，或者您取消了配对。');
      } else if (error.name === 'NotSupportedError') {
        alert('当前环境不支持蓝牙，请确保网站使用 HTTPS，或者您在本地 (localhost) 运行。');
      } else {
        alert(`蓝牙连接失败: ${error.message}`);
      }
      setDeviceStatus('disconnected');
    }
  }, [setDeviceStatus]);

  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
  }, []);

  const parseBleData = (data: string) => {
    const { addBehaviorToHistory, appPhase, setAppPhase, activeTab, setCurrentPressure } = useAppStore.getState();
    
    // 如果当前处于空闲状态且在监测页，收到数据就开始监测
    if (appPhase === 'idle' && activeTab === 'monitor') {
      setAppPhase('monitoring');
    }

    try {
      // 兼容 JSON 格式和纯数字字符串
      let behavior: BehaviorType = 'idle';
      let pressureVal = 0.5;

      const strValue = data.trim();

      // 解析硬件发送的 1, 2, 3
      if (strValue === '1') {
        behavior = 'light_press';
        pressureVal = 0.2; // 视觉映射用的相对压力
      } else if (strValue === '2') {
        behavior = 'normal_press';
        pressureVal = 0.5;
      } else if (strValue === '3') {
        behavior = 'hard_press';
        pressureVal = 0.9;
      } else {
        // 兼容原有的 JSON 格式
        try {
          const parsed = JSON.parse(data);
          if (parsed.pressure !== undefined) {
            pressureVal = parsed.pressure;
          }
          if (parsed.behavior) {
            behavior = parsed.behavior;
          }
        } catch (e) {
          // ignore
        }
      }
      
      setCurrentPressure(pressureVal);
      
      // 只有在监测期或叙事期（用户按压跟随引导时）才记录动作
      if (appPhase !== 'evaluating' && behavior !== 'idle') {
        setCurrentBehavior(behavior);
        addBehaviorToHistory(behavior);
      }
    } catch (e) {
      console.error("BLE Parse Error", e);
    }
  };

  // 模拟蓝牙数据接收
  const simulateData = useCallback((behavior: BehaviorType, pressure: number = 0.5, duration: number = 400) => {
    const { addBehaviorToHistory, appPhase, setAppPhase, activeTab, setCurrentPressure } = useAppStore.getState();

    // 模拟压力值
    setCurrentPressure(pressure);
    
    // 延迟恢复压力值，模拟真实按压的持续时间
    setTimeout(() => {
      useAppStore.getState().setCurrentPressure(0);
    }, duration);

    // 在行为监测页且处于闲置状态时，触发开始监测
    if (appPhase === 'idle' && activeTab === 'monitor') {
      setAppPhase('monitoring');
    }

    // 在评估期间不再记录新的行为
    if (appPhase !== 'evaluating') {
      setCurrentBehavior(behavior);
      addBehaviorToHistory(behavior);
    }
  }, [setCurrentBehavior]);

  return {
    connect,
    disconnect,
    simulateData,
  };
};
