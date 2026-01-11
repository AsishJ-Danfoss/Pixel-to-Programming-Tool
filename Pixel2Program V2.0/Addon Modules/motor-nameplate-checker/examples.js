/**
 * Usage Examples for MotorNameplateChecker
 * 
 * Simple examples showing how to use the class in n8n Code Nodes
 */

// Example 1: Verify motor data manually
console.log('\n=== Example 1: Verify Motor Data ===\n');

// Include the class (in n8n, just paste the class code above this)
// For this demo, we'll require it
const MotorNameplateChecker = require('./MotorNameplateChecker.js');

const checker = new MotorNameplateChecker();

const motorData = {
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

checker.verify(motorData).then(result => {
    console.log('Verification Result:');
    console.log(JSON.stringify(result, null, 2));

    // Example 2: Use static methods
    console.log('\n=== Example 2: Static Calculation Methods ===\n');

    const computed_kW = MotorNameplateChecker.computeKW({
        V: 400,
        A: 15.2,
        cosphi: 0.84,
        effPercent: 95.5
    });
    console.log(`Computed Power: ${computed_kW?.toFixed(2)} kW`);

    const efficiency = MotorNameplateChecker.computeEfficiency({
        kW: 7.5,
        V: 400,
        A: 15.2,
        cosphi: 0.84
    });
    console.log(`Computed Efficiency: ${efficiency?.toFixed(2)}%`);

    const cosphi = MotorNameplateChecker.computeCosphi({
        kW: 7.5,
        V: 400,
        A: 15.2,
        effPercent: 95.5
    });
    console.log(`Computed Cosphi: ${cosphi?.toFixed(3)}`);

    // Example 3: Auto-fill missing data
    console.log('\n=== Example 3: Auto-Fill Missing Data ===\n');

    const incompleteData = {
        motor_model: 'Test Motor',
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5,
        frequency_Hz: 50,
        speed_rpm: 1450,
        connection_type: 'STAR',
        powerFactor_cosphi: null, // Missing - will be computed
        efficiency_percent: 95.5
    };

    return checker.verify(incompleteData);
}).then(result => {
    console.log('Auto-fill Result:');
    console.log(JSON.stringify(result, null, 2));

    // Example 4: Validation
    console.log('\n=== Example 4: Field Validation ===\n');

    const validation = MotorNameplateChecker.validateRequiredFields({
        voltage_V: 400,
        current_A: 15.2,
        power_kW: 7.5
    });
    console.log('Validation:', validation);

    const invalidValidation = MotorNameplateChecker.validateRequiredFields({
        voltage_V: 400,
        current_A: null,
        power_kW: 7.5
    });
    console.log('Invalid Validation:', invalidValidation);

    console.log('\n=== Examples Complete ===\n');
});
