// Payment Gateway Testing Script
// This script tests both Orange Money and SAMA Money integrations

const testOrangePayment = async () => {
  console.log('🍊 Testing Orange Money Payment Gateway...');
  
  try {
    const response = await fetch('http://localhost:5000/api/payments/initiate-orange-money', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000,
        currency: 'CFA',
        phone: '+223 70 00 00 00',
        email: 'test@elverraglobal.com',
        name: 'Test Customer',
        reference: `OM_TEST_${Date.now()}`
      })
    });

    const data = await response.json();
    
    console.log('Orange Money Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { gateway: 'Orange Money', success: response.ok, data };
  } catch (error) {
    console.error('Orange Money Error:', error.message);
    return { gateway: 'Orange Money', success: false, error: error.message };
  }
};

const testSamaPayment = async () => {
  console.log('💰 Testing SAMA Money Payment Gateway...');
  
  try {
    const response = await fetch('http://localhost:5000/api/payments/initiate-sama-money', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000,
        currency: 'CFA',
        phone: '+223 70 00 00 00',
        email: 'test@elverraglobal.com',
        name: 'Test Customer',
        reference: `SAMA_TEST_${Date.now()}`
      })
    });

    const data = await response.json();
    
    console.log('SAMA Money Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { gateway: 'SAMA Money', success: response.ok, data };
  } catch (error) {
    console.error('SAMA Money Error:', error.message);
    return { gateway: 'SAMA Money', success: false, error: error.message };
  }
};

const runTests = async () => {
  console.log('🚀 Starting Payment Gateway Tests...\n');
  
  const results = [];
  
  // Test Orange Money
  const orangeResult = await testOrangePayment();
  results.push(orangeResult);
  
  // Wait a moment between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test SAMA Money
  const samaResult = await testSamaPayment();
  results.push(samaResult);
  
  // Summary
  console.log('\n📊 Test Summary:');
  results.forEach(result => {
    console.log(`${result.gateway}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!result.success && result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.data && result.data.error) {
      console.log(`  Details: ${result.data.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nOverall: ${successCount}/${results.length} gateways operational`);
};

// Run the tests
runTests().catch(console.error);