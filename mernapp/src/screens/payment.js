import React, { useState } from 'react';
import { FaMobileAlt, FaUniversity, FaCreditCard } from 'react-icons/fa';

const PaymentGatewayScreen = () => {
  const [activeMethod, setActiveMethod] = useState('upi');
  const [activeCardType, setActiveCardType] = useState('visa');
  const [formData, setFormData] = useState({
    upi: { upiId: '', upiPin: '' },
    netbanking: { bankName: '', accountNumber: '', password: '' },
    card: { cardNumber: '', expiryDate: '', cvv: '' }
  });

  // Styles
  const styles = {
    root: {
      background: 'linear-gradient(135deg, #00c6fb, #005bea)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1d1d1f',
      padding: '20px',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    container: {
      backgroundColor: 'white',
      borderRadius: '18px',
      width: '100%',
      maxWidth: '500px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(0) scale(1)',
      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
      ':hover': {
        transform: 'translateY(-5px) scale(1.01)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
      }
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '30px',
      textAlign: 'center',
      color: '#1d1d1f'
    },
    paymentMethods: {
      display: 'flex',
      marginBottom: '25px',
      borderBottom: '1px solid #e5e5e9'
    },
    paymentMethod: {
      flex: '1',
      padding: '15px',
      textAlign: 'center',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      transition: 'all 0.3s ease'
    },
    activePaymentMethod: {
      borderBottomColor: '#0071e3'
    },
    paymentForm: {
      display: 'none',
      animation: 'fadeIn 0.3s ease'
    },
    activePaymentForm: {
      display: 'block'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d2d2d7',
      borderRadius: '8px',
      fontSize: '16px'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d2d2d7',
      borderRadius: '8px',
      fontSize: '16px'
    },
    cardTypes: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px'
    },
    cardType: {
      flex: '1',
      padding: '10px',
      border: '1px solid #d2d2d7',
      borderRadius: '8px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }
    },
    activeCardType: {
      borderColor: '#0071e3',
      backgroundColor: 'rgba(0, 125, 250, 0.05)'
    },
    cardImage: {
      height: '20px'
    },
    expiryCvv: {
      display: 'flex',
      gap: '15px'
    },
    submitBtn: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(to right, #30d158, #34c759)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      zIndex: '1',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 12px rgba(52, 199, 89, 0.3)'
      },
      '::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to right, #34c759, #30d158)',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: '-1'
      },
      ':hover::before': {
        opacity: '1'
      }
    },
    '@keyframes fadeIn': {
      from: { opacity: '0', transform: 'translateY(10px)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    }
  };

  const handleMethodChange = (method) => {
    setActiveMethod(method);
  };

  const handleCardTypeChange = (cardType) => {
    setActiveCardType(cardType);
  };

  const handleInputChange = (method, field, value) => {
    setFormData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  const formatCardNumber = (value) => {
    let formatted = value.replace(/\s+/g, '').replace(/\D/g, '');
    if (formatted.length > 16) formatted = formatted.substring(0, 16);
    let result = '';
    for (let i = 0; i < formatted.length; i++) {
      if (i > 0 && i % 4 === 0) result += ' ';
      result += formatted[i];
    }
    return result;
  };

  const formatExpiryDate = (value) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.length > 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
    }
    return formatted;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Payment processed successfully!');
    console.log('Payment data:', formData[activeMethod]);
    // Here you would typically send the data to your backend
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <h1 style={styles.title}>AirNexus Payment Gateway</h1>
        
        <div style={styles.paymentMethods}>
          <div 
            style={{
              ...styles.paymentMethod,
              ...(activeMethod === 'upi' ? styles.activePaymentMethod : {})
            }} 
            onClick={() => handleMethodChange('upi')}
          >
            <FaMobileAlt style={{ color: '#5f5cff', fontSize: '24px', marginBottom: '8px', display: 'block' }} />
            UPI
          </div>
          <div 
            style={{
              ...styles.paymentMethod,
              ...(activeMethod === 'netbanking' ? styles.activePaymentMethod : {})
            }} 
            onClick={() => handleMethodChange('netbanking')}
          >
            <FaUniversity style={{ color: '#0071e3', fontSize: '24px', marginBottom: '8px', display: 'block' }} />
            Net Banking
          </div>
          <div 
            style={{
              ...styles.paymentMethod,
              ...(activeMethod === 'card' ? styles.activePaymentMethod : {})
            }} 
            onClick={() => handleMethodChange('card')}
          >
            <FaCreditCard style={{ color: '#ff2d55', fontSize: '24px', marginBottom: '8px', display: 'block' }} />
            Card
          </div>
        </div>
        
        {/* UPI Form */}
        <form 
          id="upiForm" 
          style={{
            ...styles.paymentForm,
            ...(activeMethod === 'upi' ? styles.activePaymentForm : {})
          }} 
          onSubmit={handleSubmit}
        >
          <div style={styles.formGroup}>
            <label style={styles.label}>UPI ID</label>
            <input 
              type="text" 
              placeholder="yourname@upi" 
              required 
              value={formData.upi.upiId}
              onChange={(e) => handleInputChange('upi', 'upiId', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>UPI PIN</label>
            <input 
              type="password" 
              placeholder="••••••" 
              required 
              value={formData.upi.upiPin}
              onChange={(e) => handleInputChange('upi', 'upiPin', e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>Pay Now</button>
        </form>
        
        {/* Net Banking Form */}
        <form 
          id="netbankingForm" 
          style={{
            ...styles.paymentForm,
            ...(activeMethod === 'netbanking' ? styles.activePaymentForm : {})
          }} 
          onSubmit={handleSubmit}
        >
          <div style={styles.formGroup}>
            <label style={styles.label}>Bank Name</label>
            <select 
              required 
              value={formData.netbanking.bankName}
              onChange={(e) => handleInputChange('netbanking', 'bankName', e.target.value)}
              style={styles.select}
            >
              <option value="">Select your bank</option>
              <option>SBI</option>
              <option>HDFC</option>
              <option>ICICI</option>
              <option>Axis</option>
              <option>Kotak</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Account Number</label>
            <input 
              type="text" 
              placeholder="Enter account number" 
              required 
              value={formData.netbanking.accountNumber}
              onChange={(e) => handleInputChange('netbanking', 'accountNumber', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              required 
              value={formData.netbanking.password}
              onChange={(e) => handleInputChange('netbanking', 'password', e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>Pay Now</button>
        </form>
        
        {/* Card Form */}
        <form 
          id="cardForm" 
          style={{
            ...styles.paymentForm,
            ...(activeMethod === 'card' ? styles.activePaymentForm : {})
          }} 
          onSubmit={handleSubmit}
        >
          <div style={styles.cardTypes}>
            <div 
              style={{
                ...styles.cardType,
                ...(activeCardType === 'visa' ? styles.activeCardType : {})
              }} 
              onClick={() => handleCardTypeChange('visa')}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                alt="Visa" 
                style={styles.cardImage}
              />
            </div>
            <div 
              style={{
                ...styles.cardType,
                ...(activeCardType === 'mastercard' ? styles.activeCardType : {})
              }} 
              onClick={() => handleCardTypeChange('mastercard')}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                alt="Mastercard" 
                style={styles.cardImage}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Card Number</label>
            <input 
              type="text" 
              placeholder="•••• •••• •••• ••••" 
              required 
              value={formData.card.cardNumber}
              onChange={(e) => handleInputChange('card', 'cardNumber', formatCardNumber(e.target.value))}
              style={styles.input}
            />
          </div>
          <div style={styles.expiryCvv}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                required 
                value={formData.card.expiryDate}
                onChange={(e) => handleInputChange('card', 'expiryDate', formatExpiryDate(e.target.value))}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CVV</label>
              <input 
                type="password" 
                placeholder="•••" 
                required 
                value={formData.card.cvv}
                onChange={(e) => handleInputChange('card', 'cvv', e.target.value.replace(/\D/g, ''))}
                maxLength="3"
                style={styles.input}
              />
            </div>
          </div>
          <button type="submit" style={styles.submitBtn}>Pay Now</button>
        </form>
      </div>
    </div>
  );
};

export default PaymentGatewayScreen;