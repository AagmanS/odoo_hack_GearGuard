// TensorFlow.js-powered predictive analytics for equipment failure prediction
import * as tf from '@tensorflow/tfjs';

class EquipmentFailurePredictor {
  constructor() {
    this.model = null;
    this.isTraining = false;
    this.history = null;
  }

  // Initialize the model architecture
  async initModel(inputShape) {
    this.model = tf.sequential();
    
    // Add LSTM layers for time series prediction
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: inputShape  // [sequenceLength, features]
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: false
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Dense layers for final prediction
    this.model.add(tf.layers.dense({ units: 25, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Output: failure probability [0,1]
    
    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return this.model;
  }

  // Preprocess historical data for training
  preprocessData(rawData) {
    // Normalize the data
    const normalizedData = this.normalizeData(rawData);
    
    // Create sequences for time series analysis
    const sequences = this.createSequences(normalizedData, 10); // 10 time steps
    
    // Separate features and labels
    const features = sequences.slice(0, sequences.length - 1);
    const labels = sequences.slice(1).map(seq => seq[seq.length - 1].failure_occurred); // Predict next failure
    
    return { features: tf.tensor3d(features), labels: tf.tensor2d(labels) };
  }

  // Normalize data to [0,1] range
  normalizeData(data) {
    if (!data || data.length === 0) return [];
    
    // Find min/max for each feature
    const featureCount = Object.keys(data[0]).length - 1; // Exclude the target variable
    const normalized = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = { ...data[i] };
      
      // Normalize each feature (excluding the target variable)
      for (const key in row) {
        if (key !== 'failure_occurred' && typeof row[key] === 'number') {
          // For simplicity, using min-max normalization based on the dataset
          // In a real application, you'd want to pre-calculate these values
          const values = data.map(d => d[key]);
          const min = Math.min(...values);
          const max = Math.max(...values);
          row[key] = (row[key] - min) / (max - min || 1); // Avoid division by zero
        }
      }
      
      normalized.push(row);
    }
    
    return normalized;
  }

  // Create sequences for LSTM input
  createSequences(data, sequenceLength) {
    const sequences = [];
    
    for (let i = 0; i <= data.length - sequenceLength; i++) {
      sequences.push(data.slice(i, i + sequenceLength));
    }
    
    return sequences;
  }

  // Train the model with historical data
  async train(historicalData, epochs = 50) {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }
    
    this.isTraining = true;
    
    try {
      // Initialize model if not already done
      if (!this.model) {
        // Determine input shape from data
        const sequenceLength = 10;
        const featureCount = Object.keys(historicalData[0]).length - 1; // Exclude target
        await this.initModel([sequenceLength, featureCount]);
      }
      
      // Preprocess the data
      const { features, labels } = this.preprocessData(historicalData);
      
      // Train the model
      this.history = await this.model.fit(features, labels, {
        epochs,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${epochs}, Loss: ${logs.loss.toFixed(4)}, Accuracy: ${(logs.acc || logs.accuracy).toFixed(4)}`);
          }
        }
      });
      
      // Clean up tensors
      features.dispose();
      labels.dispose();
      
      this.isTraining = false;
      
      return this.history;
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }

  // Predict failure probability for given equipment
  async predictFailure(equipmentData) {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }
    
    // Preprocess the input data
    const sequence = this.createSequences([equipmentData], 10)[0];
    const normalizedSequence = this.normalizeData(sequence);
    
    // Convert to tensor
    const inputTensor = tf.tensor3d([normalizedSequence]);
    
    // Make prediction
    const prediction = await this.model.predict(inputTensor).data();
    
    // Clean up tensor
    inputTensor.dispose();
    
    return {
      failureProbability: prediction[0],
      riskLevel: this.getRiskLevel(prediction[0]),
      confidence: this.calculateConfidence(equipmentData)
    };
  }

  // Determine risk level based on probability
  getRiskLevel(probability) {
    if (probability < 0.3) return 'LOW';
    if (probability < 0.6) return 'MEDIUM';
    if (probability < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  // Calculate confidence based on data quality
  calculateConfidence(data) {
    // Simple confidence calculation based on data completeness
    const totalFields = Object.keys(data).length;
    const filledFields = Object.values(data).filter(val => val !== null && val !== undefined).length;
    return filledFields / totalFields;
  }

  // Save the model
  async saveModel() {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    const saveResults = await this.model.save('localstorage://equipment-failure-predictor');
    return saveResults;
  }

  // Load the model
  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('localstorage://equipment-failure-predictor');
      return this.model;
    } catch (error) {
      console.warn('Could not load model from storage:', error);
      return null;
    }
  }

  // Generate predictive maintenance schedule
  async generateMaintenanceSchedule(equipmentList) {
    const schedule = [];
    
    for (const equipment of equipmentList) {
      try {
        const prediction = await this.predictFailure(equipment.historical_data);
        
        // Calculate maintenance window based on prediction
        const daysToFailure = Math.max(1, Math.floor(30 * (1 - prediction.failureProbability)));
        
        schedule.push({
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          failure_probability: prediction.failureProbability,
          risk_level: prediction.riskLevel,
          recommended_maintenance_days: daysToFailure,
          confidence: prediction.confidence,
          priority: this.calculatePriority(prediction.riskLevel, equipment.criticality)
        });
      } catch (error) {
        console.error(`Error predicting failure for equipment ${equipment.id}:`, error);
        schedule.push({
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          error: error.message
        });
      }
    }
    
    // Sort by priority
    return schedule.sort((a, b) => b.priority - a.priority);
  }

  // Calculate maintenance priority
  calculatePriority(riskLevel, criticality) {
    let riskScore = 0;
    
    switch (riskLevel) {
      case 'CRITICAL': riskScore = 4;
      case 'HIGH': riskScore = 3;
      case 'MEDIUM': riskScore = 2;
      case 'LOW': riskScore = 1;
    }
    
    // Criticality factor (1-10 scale)
    const criticalityFactor = Math.min(criticality, 10) / 10;
    
    return riskScore * 10 + criticalityFactor * 10;
  }

  // Get model summary
  getModelSummary() {
    if (!this.model) return null;
    
    return {
      layers: this.model.layers.length,
      parameters: this.model.countParams(),
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape
    };
  }
}

// Export the predictor
export default new EquipmentFailurePredictor();