import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Toggle, Input, Select } from '../fields';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      enableTracking: true,
      dataRetentionDays: 90,
      refreshInterval: 'daily',
    },
    display: {
      defaultCurrency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      decimalPlaces: 2,
    },
    integrations: {
      enableWooCommerce: true,
      enableGoogleAnalytics: false,
      googleAnalyticsId: '',
      enableFacebookPixel: false,
      facebookPixelId: '',
    },
    notifications: {
      enableEmailAlerts: false,
      emailRecipients: '',
      alertThreshold: 10,
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  useEffect(() => {
    // Simulate API call to fetch settings
    setTimeout(() => {
      // In a real implementation, this would fetch from an API
      // const response = await fetch('/wp-json/product-kpi-tracker/v1/settings');
      // const data = await response.json();
      // setSettings(data);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSettingChange = (section, setting, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: value
      }
    });
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      // In a real implementation, this would be an API call
      // await fetch('/wp-json/product-kpi-tracker/v1/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };
  
  const refreshIntervalOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];
  
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' }
  ];
  
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];
  
  const decimalPlacesOptions = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
  ];
  
  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }
  
  return (
    <div className="pkt-admin-container">
      <Title text="Settings" />
      
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'display' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveTab('display')}
        >
          Display
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'integrations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      
      {activeTab === 'general' && (
        <Card className="mb-6">
          <Title text="General Settings" level="h3" className="mb-4" />
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Toggle 
                checked={settings.general.enableTracking} 
                onChange={(e) => handleSettingChange('general', 'enableTracking', e.target.checked)} 
              />
              <label className="ml-2">Enable KPI Tracking</label>
            </div>
            <p className="text-sm text-gray-500 ml-10">Collect and analyze product performance data</p>
          </div>
          
          <div className="mb-4">
            <label className="pkt-label">Data Retention Period (days)</label>
            <Input 
              type="number" 
              value={settings.general.dataRetentionDays} 
              onChange={(e) => handleSettingChange('general', 'dataRetentionDays', parseInt(e.target.value))} 
              min="1"
              max="365"
              className="w-32"
            />
            <p className="text-sm text-gray-500 mt-1">How long to keep detailed KPI data before aggregation</p>
          </div>
          
          <div className="mb-4">
            <label className="pkt-label">Data Refresh Interval</label>
            <Select 
              options={refreshIntervalOptions} 
              value={settings.general.refreshInterval} 
              onChange={(e) => handleSettingChange('general', 'refreshInterval', e.target.value)} 
              className="w-64"
            />
            <p className="text-sm text-gray-500 mt-1">How often to refresh KPI calculations</p>
          </div>
        </Card>
      )}
      
      {activeTab === 'display' && (
        <Card className="mb-6">
          <Title text="Display Settings" level="h3" className="mb-4" />
          
          <div className="mb-4">
            <label className="pkt-label">Default Currency</label>
            <Select 
              options={currencyOptions} 
              value={settings.display.defaultCurrency} 
              onChange={(e) => handleSettingChange('display', 'defaultCurrency', e.target.value)} 
              className="w-64"
            />
          </div>
          
          <div className="mb-4">
            <label className="pkt-label">Date Format</label>
            <Select 
              options={dateFormatOptions} 
              value={settings.display.dateFormat} 
              onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)} 
              className="w-64"
            />
          </div>
          
          <div className="mb-4">
            <label className="pkt-label">Decimal Places</label>
            <Select 
              options={decimalPlacesOptions} 
              value={settings.display.decimalPlaces} 
              onChange={(e) => handleSettingChange('display', 'decimalPlaces', parseInt(e.target.value))} 
              className="w-32"
            />
            <p className="text-sm text-gray-500 mt-1">Number of decimal places to display in monetary values</p>
          </div>
        </Card>
      )}
      
      {activeTab === 'integrations' && (
        <Card className="mb-6">
          <Title text="Integrations" level="h3" className="mb-4" />
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Toggle 
                checked={settings.integrations.enableWooCommerce} 
                onChange={(e) => handleSettingChange('integrations', 'enableWooCommerce', e.target.checked)} 
              />
              <label className="ml-2">WooCommerce Integration</label>
            </div>
            <p className="text-sm text-gray-500 ml-10">Pull product data from WooCommerce</p>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Toggle 
                checked={settings.integrations.enableGoogleAnalytics} 
                onChange={(e) => handleSettingChange('integrations', 'enableGoogleAnalytics', e.target.checked)} 
              />
              <label className="ml-2">Google Analytics Integration</label>
            </div>
            {settings.integrations.enableGoogleAnalytics && (
              <div className="ml-10 mt-2">
                <label className="pkt-label">Google Analytics ID</label>
                <Input 
                  value={settings.integrations.googleAnalyticsId} 
                  onChange={(e) => handleSettingChange('integrations', 'googleAnalyticsId', e.target.value)} 
                  placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  className="w-64"
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Toggle 
                checked={settings.integrations.enableFacebookPixel} 
                onChange={(e) => handleSettingChange('integrations', 'enableFacebookPixel', e.target.checked)} 
              />
              <label className="ml-2">Facebook Pixel Integration</label>
            </div>
            {settings.integrations.enableFacebookPixel && (
              <div className="ml-10 mt-2">
                <label className="pkt-label">Facebook Pixel ID</label>
                <Input 
                  value={settings.integrations.facebookPixelId} 
                  onChange={(e) => handleSettingChange('integrations', 'facebookPixelId', e.target.value)} 
                  placeholder="XXXXXXXXXXXXXXXXXX"
                  className="w-64"
                />
              </div>
            )}
          </div>
        </Card>
      )}
      
      {activeTab === 'notifications' && (
        <Card className="mb-6">
          <Title text="Notification Settings" level="h3" className="mb-4" />
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Toggle 
                checked={settings.notifications.enableEmailAlerts} 
                onChange={(e) => handleSettingChange('notifications', 'enableEmailAlerts', e.target.checked)} 
              />
              <label className="ml-2">Enable Email Alerts</label>
            </div>
            <p className="text-sm text-gray-500 ml-10">Receive email notifications for significant KPI changes</p>
          </div>
          
          {settings.notifications.enableEmailAlerts && (
            <>
              <div className="mb-4">
                <label className="pkt-label">Email Recipients</label>
                <Input 
                  value={settings.notifications.emailRecipients} 
                  onChange={(e) => handleSettingChange('notifications', 'emailRecipients', e.target.value)} 
                  placeholder="email@example.com, another@example.com"
                />
                <p className="text-sm text-gray-500 mt-1">Comma-separated list of email addresses</p>
              </div>
              
              <div className="mb-4">
                <label className="pkt-label">Alert Threshold (%)</label>
                <Input 
                  type="number" 
                  value={settings.notifications.alertThreshold} 
                  onChange={(e) => handleSettingChange('notifications', 'alertThreshold', parseInt(e.target.value))} 
                  min="1"
                  max="100"
                  className="w-32"
                />
                <p className="text-sm text-gray-500 mt-1">Minimum percentage change to trigger an alert</p>
              </div>
            </>
          )}
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button 
          text={isSaving ? 'Saving...' : 'Save Settings'} 
          onClick={handleSaveSettings} 
          disabled={isSaving} 
        />
      </div>
    </div>
  );
};

export default Settings;
