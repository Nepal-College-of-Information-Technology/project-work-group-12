import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Smartphone,
  Copy,
  Check,
  Apple,
  CheckCircle
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface WifiCredentials {
  ssid: string;
  password: string;
}

interface QRScannerProps {
  onScanComplete: (tableId: string) => void;
}

export function QRScanner({ onScanComplete }: QRScannerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [tableId, setTableId] = useState('');
  const [step, setStep] = useState(1);

  const wifiCredentials: WifiCredentials = {
    ssid: 'TableTap_Premium',
    password: 'Welcome2024'
  };

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsAndroid(/Android/i.test(userAgent));
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    if (/iPhone|iPad|iPod/i.test(userAgent)) setActiveTab('ios');
  }, []);

  useEffect(() => {
    const scannedTableId = 'T' + Math.random().toString(36).substr(2, 4).toUpperCase();
    setTableId(scannedTableId);
  }, []);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(wifiCredentials.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateWifiQRCode = () => {
    return `WIFI:T:WPA;S:${wifiCredentials.ssid};P:${wifiCredentials.password};;`;
  };

  const handleAndroidConnect = () => {
    window.location.href = `intent://wifi/${wifiCredentials.ssid}#Intent;scheme=android-settings;end`;
    setTimeout(() => alert('If nothing happened, please connect manually in WiFi settings.'), 1500);
    setStep(2);
  };

  const handleIOSConnect = () => {
    alert('Please go to Settings > WiFi and connect manually.');
    window.location.href = 'App-Prefs:root=WIFI';
    setStep(2);
  };

  const handleProceed = () => {
    onScanComplete(tableId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-2xl mt-10"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        {step === 1 && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wifi className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Connect to {wifiCredentials.ssid}</h2>
            <p className="text-gray-600 mt-2">Select your device type</p>
          </>
        )}
      </motion.div>

      {step === 1 && (
        <>
          <div className="flex border-b border-gray-200 mb-6">
            {['android', 'ios'].map((tab) => (
              <button
                key={tab}
                className={`flex items-center justify-center py-2 px-4 font-medium flex-1 transition-colors duration-200 ${
                  activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab(tab as 'android' | 'ios')}
              >
                {tab === 'android' ? <Smartphone className="mr-2 w-4 h-4" /> : <Apple className="mr-2 w-4 h-4" />}
                {tab === 'android' ? 'Android' : 'iPhone/iPad'}
              </button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Network:</span>
                <span className="font-mono font-medium">{wifiCredentials.ssid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Password:</span>
                <div className="flex items-center">
                  <span className="font-mono font-medium mr-2">••••••••</span>
                  <Button variant="ghost" size="sm" onClick={copyPassword} className="h-8 px-2">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={activeTab === 'android' ? handleAndroidConnect : handleIOSConnect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Wifi className="mr-2" />
                {activeTab === 'android' ? 'Connect Automatically' : 'Open WiFi Settings'}
              </Button>

              <div className="text-center text-gray-500">OR</div>

              <div className="text-center">
                <p className="mb-2 text-sm text-gray-600">Scan QR code with your camera</p>
                <div className="p-2 bg-white inline-block rounded-lg border border-gray-200">
                  <QRCode value={generateWifiQRCode()} size={160} bgColor="#ffffff" fgColor="#000000" />
                </div>
                <p className="mt-2 text-xs text-gray-500">iOS 11+ recognizes WiFi QR codes automatically</p>
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium">Manual Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 mt-1">
                  <li>Open Settings</li>
                  <li>Go to WiFi</li>
                  <li>Select {wifiCredentials.ssid}</li>
                  <li>Enter the password</li>
                </ol>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center mt-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>

          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Connected Successfully!
            </h3>
            <p className="text-slate-600">
              You're now connected to our premium WiFi network. Ready to explore our menu?
            </p>
          </div>

          <Button
            onClick={handleProceed}
            className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-medium rounded-lg shadow-lg transition-all duration-200"
          >
            Explore Menu
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
