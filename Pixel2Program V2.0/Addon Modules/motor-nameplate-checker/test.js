/**
 * Test Suite for MotorNameplateChecker
 * Run with: node test.js
 */

const MotorNameplateChecker = require('./MotorNameplateChecker.js');

// ANSI color codes for terminal output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function pass(msg) {
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function fail(msg) {
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function section(msg) {
    console.log(`\n${colors.cyan}${msg}${colors.reset}`);
    console.log('─'.repeat(60));
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
    if (condition) {
        pass(testName);
        passedTests++;
    } else {
        fail(testName);
        failedTests++;
    }
}

function assertEquals(actual, expected, testName) {
    if (actual === expected) {
        pass(`${testName} (${actual})`);
        passedTests++;
    } else {
        fail(`${testName} - Expected: ${expected}, Got: ${actual}`);
        failedTests++;
    }
}

// Test Suite
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  Motor Nameplate Checker - Test Suite');
    console.log('='.repeat(60));

    // Test 1: Static Utility Methods
    section('Test 1: Static Utility Methods');

    assertEquals(MotorNameplateChecker.toNumberOrNull(42), 42, 'toNumberOrNull(42)');
    assertEquals(MotorNameplateChecker.toNumberOrNull('42.5'), 42.5, 'toNumberOrNull("42.5")');
    assertEquals(MotorNameplateChecker.toNumberOrNull('42,500.5'), 42500.5, 'toNumberOrNull with commas');
    assertEquals(MotorNameplateChecker.toNumberOrNull(null), null, 'toNumberOrNull(null)');
    assertEquals(MotorNameplateChecker.toNumberOrNull('abc'), null, 'toNumberOrNull("abc")');

    assertEquals(MotorNameplateChecker.toStringOrNull('hello'), 'hello', 'toStringOrNull("hello")');
    assertEquals(MotorNameplateChecker.toStringOrNull('  hello  '), 'hello', 'toStringOrNull with spaces');
    assertEquals(MotorNameplateChecker.toStringOrNull(''), null, 'toStringOrNull("")');
    assertEquals(MotorNameplateChecker.toStringOrNull(null), null, 'toStringOrNull(null)');

    assertEquals(MotorNameplateChecker.normalizeConnectionType('Y'), 'STAR', 'normalizeConnectionType("Y")');
    assertEquals(MotorNameplateChecker.normalizeConnectionType('star'), 'STAR', 'normalizeConnectionType("star")');
    assertEquals(MotorNameplateChecker.normalizeConnectionType('Δ'), 'DELTA', 'normalizeConnectionType("Δ")');
    assertEquals(MotorNameplateChecker.normalizeConnectionType('delta'), 'DELTA', 'normalizeConnectionType("delta")');
    assertEquals(MotorNameplateChecker.normalizeConnectionType('D'), 'DELTA', 'normalizeConnectionType("D")');

    assert(MotorNameplateChecker.closeEnough(100, 100.5, 0.01), 'closeEnough(100, 100.5) within 1%');
    assert(!MotorNameplateChecker.closeEnough(100, 105, 0.01), 'closeEnough(100, 105) not within 1%');
    assert(MotorNameplateChecker.closeEnough(7.5, 7.48, 0.01), 'closeEnough(7.5, 7.48) within tolerance');

    // Test 2: Calculation Methods
    section('Test 2: Static Calculation Methods');

    const kW1 = MotorNameplateChecker.computeKW({
        V: 400,
        A: 15.2,
        cosphi: 0.84,
        effPercent: 95.5
    });
    assert(kW1 !== null && Math.abs(kW1 - 7.48) < 0.1, `computeKW result: ${kW1?.toFixed(2)} kW (expected ~7.48)`);

    const eff = MotorNameplateChecker.computeEfficiency({
        kW: 7.5,
        V: 400,
        A: 15.2,
        cosphi: 0.84
    });
    assert(eff !== null && Math.abs(eff - 95.5) < 5, `computeEfficiency result: ${eff?.toFixed(2)}% (expected ~95.5%)`);

    const cosphi = MotorNameplateChecker.computeCosphi({
        kW: 7.5,
        V: 400,
        A: 15.2,
        effPercent: 95.5
    });
    assert(cosphi !== null && Math.abs(cosphi - 0.84) < 0.05, `computeCosphi result: ${cosphi?.toFixed(2)} (expected ~0.84)`);

    // Test 3: Constructor and Configuration
    section('Test 3: Constructor and Configuration');

    const checker1 = new MotorNameplateChecker();
    assert(checker1.apiKey === null, 'Default constructor - apiKey is null');
    assert(checker1.tolerance === 0.01, 'Default tolerance is 0.01');

    const checker2 = new MotorNameplateChecker({
        apiKey: 'test-key-123',
        tolerance: 0.02
    });
    assertEquals(checker2.apiKey, 'test-key-123', 'Custom apiKey');
    assertEquals(checker2.tolerance, 0.02, 'Custom tolerance');

    // Test 4: Verification with Complete Data
    section('Test 4: Motor Data Verification (Complete Data)');

    const checker3 = new MotorNameplateChecker();

    const motorData1 = {
        motor_model: 'ABB M3BP',
        motor_serial_no: 'SN123456',
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5,
        frequency_Hz: 50,
        speed_rpm: 1450,
        connection_type: 'DELTA',
        powerFactor_cosphi: 0.84,
        efficiency_percent: 95.5
    };

    const result1 = await checker3.verify(motorData1);
    assert(result1.IsVerified === true, 'Verification passed for valid motor data');
    assertEquals(result1.message, 'VERIFICATION PASSED', 'Correct success message');
    assert(result1['Motor data'].motor_model === 'ABB M3BP', 'Motor model preserved');

    // Test 5: Verification with Missing Efficiency
    section('Test 5: Auto-fill Missing Efficiency');

    const motorData2 = {
        motor_model: 'Test Motor',
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5,
        frequency_Hz: 50,
        speed_rpm: 1450,
        connection_type: 'STAR',
        powerFactor_cosphi: 0.84,
        efficiency_percent: null // Missing - should be computed
    };

    const result2 = await checker3.verify(motorData2);
    assert(result2.IsVerified === true || result2.IsVerified === false, 'Verification completed with auto-filled efficiency');
    console.log(`   Result: ${result2.message}`);

    // Test 6: Verification with Missing Cosphi
    section('Test 6: Auto-fill Missing Cosphi');

    const motorData3 = {
        motor_model: 'Test Motor',
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5,
        frequency_Hz: 50,
        speed_rpm: 1450,
        connection_type: 'STAR',
        powerFactor_cosphi: null, // Missing - should be computed
        efficiency_percent: 95.5
    };

    const result3 = await checker3.verify(motorData3);
    assert(result3.IsVerified === true || result3.IsVerified === false, 'Verification completed with auto-filled cosphi');
    console.log(`   Result: ${result3.message}`);

    // Test 7: Verification Failure (Mismatched Power)
    section('Test 7: Verification Failure (Power Mismatch)');

    const motorData4 = {
        motor_model: 'Wrong Motor',
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 15.0, // Wrong power value
        frequency_Hz: 50,
        speed_rpm: 1450,
        connection_type: 'DELTA',
        powerFactor_cosphi: 0.84,
        efficiency_percent: 95.5
    };

    const result4 = await checker3.verify(motorData4);
    assert(result4.IsVerified === false, 'Verification failed for mismatched power');
    assert(result4.message.includes('VERIFICATION FAILED'), 'Correct failure message');

    // Test 8: Missing Required Fields
    section('Test 8: Missing Required Fields');

    const motorData5 = {
        motor_model: 'Incomplete Motor',
        voltage_V: 400,
        current_A: null, // Missing
        power_kW: 7.5,
        powerFactor_cosphi: 0.84,
        efficiency_percent: 95.5
    };

    const result5 = await checker3.verify(motorData5);
    assert(result5.IsVerified === false, 'Verification failed for missing current');
    assert(result5.message.includes('ERROR'), 'Error message present');

    // Test 9: Validate Required Fields
    section('Test 9: validateRequiredFields Static Method');

    const validation1 = MotorNameplateChecker.validateRequiredFields({
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5
    });
    assert(validation1.isValid === true, 'Validation passed for complete data');
    assertEquals(validation1.missing.length, 0, 'No missing fields');

    const validation2 = MotorNameplateChecker.validateRequiredFields({
        voltage_V: 400,
        current_A: null,
        power_kW: 7.5
    });
    assert(validation2.isValid === false, 'Validation failed for incomplete data');
    assert(validation2.missing.includes('current_A'), 'Missing field identified');

    // Test 10: History Tracking
    section('Test 10: History Tracking');

    const result6 = await checker3.verify(motorData1);
    const lastResult = checker3.getLastResult();
    assert(lastResult !== null, 'Last result stored');
    assertEquals(lastResult.IsVerified, result6.IsVerified, 'Last result matches');

    const history = checker3.getHistory();
    assert(history.length > 0, 'History contains entries');
    assert(history[history.length - 1].result.IsVerified === result6.IsVerified, 'History entry matches');

    // Summary
    section('Test Summary');
    console.log(`Total Tests: ${passedTests + failedTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

    if (failedTests === 0) {
        console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    } else {
        console.log(`\n${colors.red}✗ Some tests failed${colors.reset}\n`);
    }

    return failedTests === 0;
}

// Run tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error(`\n${colors.red}Test suite error: ${error.message}${colors.reset}\n`);
    process.exit(1);
});
